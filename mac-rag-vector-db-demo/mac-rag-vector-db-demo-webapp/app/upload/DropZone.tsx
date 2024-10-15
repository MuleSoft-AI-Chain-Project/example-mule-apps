// /* eslint-disable react/no-unescaped-entities */
// import React, { useCallback } from "react";
// import { useDropzone } from "react-dropzone";

// function MyDropzone() {
//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     acceptedFiles.forEach((file: File) => {
//       const reader = new FileReader();

//       reader.onabort = () => console.log("file reading was aborted");
//       reader.onerror = () => console.log("file reading has failed");
//       reader.onload = () => {
//         // Do whatever you want with the file contents
//         const binaryStr = reader.result as ArrayBuffer;
//         console.log(binaryStr);
//       };
//       reader.readAsArrayBuffer(file);
//     });
//   }, []);
//   const { getRootProps, getInputProps } = useDropzone({ onDrop });

//   return (
//     <div {...getRootProps()}>
//       <input {...getInputProps()} />
//       <p>Drag 'n' drop some files here, or click to select files</p>
//     </div>
//   );
// }

// export default MyDropzone;
