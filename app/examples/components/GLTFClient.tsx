import { GLTFViewer } from "./GLTFViewer";

export const GLTFClient = () => {

  return (
    // <div
    // 	className="h-full w-full flex-1 bg-gradient-to-r select-none
    // to-indigo-500 from-10% via-sky-500 via-30%
    // from-emerald-500 to-90% rounded p-2 
    // overflow-hidden flex justify-between relative"
    // >
    <div
      className="h-full w-full"
    >
      <div className="w-[20rem] h-full bg-slate-200">
        AAAAAAAAAAAAAA
      </div>

      {/* <div className="absolute top-0 bottom-0 left-0 right-0 w-auto"> */}
      <div className="">
        <GLTFViewer />
      </div>
    </div>
  )
}
