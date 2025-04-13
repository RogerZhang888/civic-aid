import useUser from "../auth/user";

export default function ProfilePage() {

   const { data: user, isLoading, error } = useUser();

   if (isLoading) return <div>Loading...</div>

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4">
         <div className="text-xl font-bold">Your Profile</div>

         <div>Hello, {user!.userName}!</div>

         <div>
            <div className="collapse collapse-plus border border-1">
               <input type="radio" name="my-accordion-3" defaultChecked />
               <div className="collapse-title font-semibold">Your Reports</div>
               <div className="collapse-content text-sm">
                  <div className="overflow-x-auto">
                     <table className="table">
                        {/* head */}
                        <thead>
                           <tr>
                              <th></th>
                              <th>Name</th>
                              <th>Job</th>
                              <th>Favorite Color</th>
                           </tr>
                        </thead>
                        <tbody>
                           {/* row 1 */}
                           <tr>
                              <th>1</th>
                              <td>Cy Ganderton</td>
                              <td>Quality Control Specialist</td>
                              <td>Blue</td>
                           </tr>
                           {/* row 2 */}
                           <tr>
                              <th>2</th>
                              <td>Hart Hagerty</td>
                              <td>Desktop Support Technician</td>
                              <td>Purple</td>
                           </tr>
                           {/* row 3 */}
                           <tr>
                              <th>3</th>
                              <td>Brice Swyre</td>
                              <td>Tax Accountant</td>
                              <td>Red</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <div className="collapse collapse-plus border border-1">
               <input type="radio" name="my-accordion-3" />
               <div className="collapse-title font-semibold">Your Queries</div>
               <div className="collapse-content text-sm">
                  <div className="overflow-x-auto">
                     <table className="table">
                        {/* head */}
                        <thead>
                           <tr>
                              <th></th>
                              <th>Name</th>
                              <th>Job</th>
                              <th>Favorite Color</th>
                           </tr>
                        </thead>
                        <tbody>
                           {/* row 1 */}
                           <tr>
                              <th>1</th>
                              <td>Cy Ganderton</td>
                              <td>Quality Control Specialist</td>
                              <td>Blue</td>
                           </tr>
                           {/* row 2 */}
                           <tr>
                              <th>2</th>
                              <td>Hart Hagerty</td>
                              <td>Desktop Support Technician</td>
                              <td>Purple</td>
                           </tr>
                           {/* row 3 */}
                           <tr>
                              <th>3</th>
                              <td>Brice Swyre</td>
                              <td>Tax Accountant</td>
                              <td>Red</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
