interface ReportCardProps {
    imageSrc: string;
    heading: string;
    description: string;
    openReport: () => void;
}

export default function ReportCard({
    imageSrc,
    heading,
    description,
    openReport,
}: ReportCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden w-70 h-96 flex flex-col">
            <div className="h-2/5 w-full">
                <img
                    src={imageSrc}
                    alt="Report preview"
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-semibold truncate">
                        {heading}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-5 mt-2">
                        {description}
                    </p>
                </div>
                <button
                    onClick={openReport}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-xl w-full mx-auto"
                >
                    View Report
                </button>
            </div>
        </div>
    );
}
