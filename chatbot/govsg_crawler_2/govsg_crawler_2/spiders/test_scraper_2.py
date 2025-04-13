import scrapy
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import re
import time
import tempfile
import os
from urllib.parse import urlparse

class GovSgEthicalCrawler(scrapy.Spider):
    name = "govsg_crawler_2"
    start_urls = ["http://www.mccy.gov.sg","http://www.mindef.gov.sg","http://www.mddi.gov.sg", "http://www.moe.gov.sg", "http://www.mof.gov.sg","http://www.mfa.gov.sg","http://www.moh.gov.sg","http://www.mha.gov.sg","http://www.mlaw.gov.sg","http://www.mom.gov.sg","http://www.mnd.gov.sg","http://www.msf.gov.sg","https://www.mse.gov.sg","http://www.mti.gov.sg","http://www.mot.gov.sg","https://www.pmo.gov.sg",]
    
    # LEGAL COMPLIANCE SETTINGS
    custom_settings = {
        'ROBOTSTXT_OBEY': True,
        'DOWNLOAD_DELAY': 3.0,
        'AUTOTHROTTLE_ENABLED': True,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'DEPTH_LIMIT': 4,
        'FEED_FORMAT': 'jsonlines',
        'FEED_URI': 'gov_text_output.jl',
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }

    ALLOWED_DOMAINS = [
        'gov.sg',
        '*.gov.sg',
        'data.gov.sg'
    ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_data_dir = tempfile.mkdtemp(prefix='chrome_profile_')
        self.driver = self._create_driver()
        self.last_request_time = 0
        self.request_interval = 5.0
        self.last_driver_refresh = time.time()
        self.driver_refresh_interval = 1800

    def _create_driver(self):
        """Create Chrome WebDriver with unique profile directory"""
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-webrtc')
        chrome_options.add_argument(f'--user-data-dir={self.user_data_dir}')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) ResearchBot/1.0')
        
        try:
            return webdriver.Chrome(options=chrome_options)
        except Exception as e:
            self.logger.error(f"Failed to create WebDriver: {str(e)}")
            raise

    def _cleanup_driver(self):
        """Safely cleanup the WebDriver instance"""
        if hasattr(self, 'driver') and self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                self.logger.warning(f"Error while quitting driver: {str(e)}")
        if hasattr(self, 'user_data_dir') and os.path.exists(self.user_data_dir):
            try:
                os.rmdir(self.user_data_dir)
            except Exception as e:
                self.logger.warning(f"Error while removing temp dir: {str(e)}")

    def parse(self, response):
        # Check if driver needs refresh
        if time.time() - self.last_driver_refresh > self.driver_refresh_interval:
            self.logger.info("Periodic driver refresh")
            self._cleanup_driver()
            self.user_data_dir = tempfile.mkdtemp(prefix='chrome_profile_')
            self.driver = self._create_driver()
            self.last_driver_refresh = time.time()

        # Domain validation
        if not self._is_allowed_domain(response.url):
            self.logger.warning(f"Skipping disallowed domain: {response.url}")
            return

        # Ethical delay
        elapsed = time.time() - self.last_request_time
        if elapsed < self.request_interval:
            time.sleep(self.request_interval - elapsed)
        self.last_request_time = time.time()

        try:
            # Verify driver session
            try:
                self.driver.current_url  # Simple session check
            except:
                self.logger.warning("Session invalidated, recreating driver...")
                self._cleanup_driver()
                self.user_data_dir = tempfile.mkdtemp(prefix='chrome_profile_')
                self.driver = self._create_driver()

            # Load page
            self.driver.get(response.url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//body')))
            time.sleep(0.5)
            
            # Process content
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            yield {
                'url': response.url,
                'title': self._safe_extract(soup.title),
                'content': self._extract_ethical_content(soup),
                'size_kb': len(response.body) / 1024,
            }

            # Follow approved links
            for link in self._get_approved_links(soup, response):
                yield response.follow(link, self.parse)

        except Exception as e:
            self.logger.error(f"Error processing {response.url}: {str(e)}")
            self._cleanup_driver()
            self.user_data_dir = tempfile.mkdtemp(prefix='chrome_profile_')
            self.driver = self._create_driver()

    '''def _extract_links_with_captions(self, soup, response):
            """Extract all links with their captions/text"""
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                caption = self._safe_extract(a)
            
                # Normalize URL
                if not href.startswith(('http', 'www')):
                    href = response.urljoin(href)
                
                # Only include allowed domains
                if self._is_allowed_domain(href):
                    links.append({
                        'url': href,
                        'caption': caption.strip() if caption else '',
                        'is_external': not href.startswith(('https://gov.sg', 'https://www.gov.sg'))
                    })
                
            return links
    '''


    def _is_allowed_domain(self, url):
        """Strict domain whitelist check"""
        parsed = urlparse(url)
        return any(
            parsed.netloc.endswith(domain) 
            for domain in self.ALLOWED_DOMAINS
        )

    def _get_approved_links(self, soup, response):
        """Link filtering with multiple safeguards"""
        found_links = set()
        
        for a in soup.find_all('a', href=True):
            href = a['href']
            
            # Skip prohibited resources
            if any(href.endswith(ext) for ext in ['.pdf', '.jpg', '.zip']):
                continue
                
            # Normalize URL
            if not href.startswith(('http', 'www')):
                href = response.urljoin(href)
                
            # Validate against whitelist
            if self._is_allowed_domain(href):
                found_links.add(href)
                
        return list(found_links)[:20]  # Strict per-page limit

    def _extract_ethical_content(self, soup):
        """Content extraction with privacy safeguards"""
        # Skip sensitive areas
        for excluded in soup.find_all(class_=re.compile(r'.*login.*|.*private.*|.*secure.*|.*visuallyhidden.*|.*icon.*', re.IGNORECASE)):
            excluded.decompose()
            
        # Extract from approved sections only
        content_blocks = []
        for selector in ['main', 'article', 'section[aria-label]']:
            content_blocks.extend(soup.select(selector))
            
        return ' '.join(
            block.get_text(' ', strip=True) 
            for block in content_blocks
            if len(block.text) > 50  # Minimum content threshold
        )

    def _safe_extract(self, element):
        """Null-safe text extraction"""
        #return element.string if element else ''
        if element:
            return element.get_text(' ', strip=True)
        return ''

    '''def _find_last_updated(self, soup):
        """Look for common update date markers"""
        for pattern in [
            r'last.?updated',
            r'published.?date',
            r'modified',
            r'as of'
        ]:
            elem = soup.find(string=re.compile(pattern, re.I))
            if elem:
                return elem.parent.get_text(strip=True)
        return ''
    '''
    def closed(self, reason):
        self.driver.quit()
        # Generate compliance report
        with open('compliance_report.txt', 'w') as f:
            f.write(f"Crawler shutdown reason: {reason}\n")
            f.write(f"Respected robots.txt: {self.settings.get('ROBOTSTXT_OBEY')}\n")
            f.write(f"Average delay: {self.settings.get('DOWNLOAD_DELAY')}s\n")