import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import { Report } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function MediaRenderCell(params: GridRenderCellParams<Report, any, any, GridTreeNodeWithRender>) {
   return (
      <div id="media-render-cell">
         {params.value.length > 0
            ?  <>
                  <button className="btn btn-sm btn-info" onClick={() => (document!.getElementById('adnim-panel-report-image-model') as HTMLDialogElement | null)?.showModal()}>
                     View
                  </button>
                  <dialog id="adnim-panel-report-image-model" className="modal">
                     <div className="modal-box w-4/5 h-4/5 max-w-6xl max-h-4xl">
                        <h3 className="font-semibold text-lg">Attached Images</h3>
                        <div className="carousel w-full">
                           {params.value.map((url: string, idx: number) => (
                              <div id={`item${idx + 1}`} className="carousel-item w-full" key={idx}>
                                 <img
                                    src={`${SERVER_API_URL}/api/files/${url}`}
                                    alt={`media ${idx}`}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                           ))}
                        </div>
                        <div className="flex w-full justify-center gap-2 py-2">
                           {params.value.map((_: string, idx: number) => (
                              <a key={idx} href={`#item${idx + 1}`} className="btn btn-xs">{idx + 1}</a>
                           ))}
                        </div>
                        <div className="modal-action">
                           <form method="dialog">
                           <button className="btn">Close</button>
                           </form>
                        </div>
                     </div>
                  </dialog>
               </>
            :  <div className="text-gray-500">No image</div>
         }
      </div>
   );
}