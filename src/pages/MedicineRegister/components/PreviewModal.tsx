// interface PreviewModalProps {
//   file: File | null;
//   name: string;
//   onClose: () => void;
//   onConfirm: () => void;
// }

// const PreviewModal = ({
//   file,
//   name,
//   onClose,
//   onConfirm,
// }: PreviewModalProps) => {
//   if (!file) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white w-[90%] max-w-md rounded-xl p-4">
//         <span className="text-lg font-bold mb-3">{name}</span>

//         {/*약 목록 띄우기*/}

//         <div className="flex gap-2">
//           <button
//             onClick={onClose} // 수정 필요
//             className="flex-1 py-2 rounded-lg border border-gray-300"
//           >
//             수정하기
//           </button>
//           <button
//             onClick={onConfirm} // 수정 필요
//             className="flex-1 py-2 rounded-lg bg-primary text-white"
//           >
//             저장하기
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PreviewModal;
