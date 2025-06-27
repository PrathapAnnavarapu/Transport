import React,{ useEffect, useState, useCallback, useMemo } from 'react'
import ToastComponent from './Toast';
import ApiComponent from './API';
import Button from './Button';
import Popup from './Model';
import Cookies from 'js-cookie';
import { LuDownload } from "react-icons/lu";
import { AiTwotoneDelete } from "react-icons/ai";
import { MdOutlineFileUpload, MdOutlineAttachment } from "react-icons/md";



const PdfUploader = ({ id, invoiceNumber }) => {

    const token = Cookies.get('jwt_token');
    const [file, setFile] = useState(null);
    const [uploadedFileStatus, setUploadedFileStatus] = useState();
    const { success, error } = ToastComponent();
    const [apiProps, setApiProps] = useState(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null)
    const [openPDF, setOpenPDF] = useState(false);
    const [openDeleteFile, setOpenDeleteFile] = useState(false)
    const [openDownloadFile, setOpenDownloadFile] = useState(false)
       


    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // extractFieldsFromPDF(selectedFile);
        }
        const input = event.target;
        const selectedFiles = input.files; // Access all selected files
        const label = document.getElementById("file-label"); // Access the label element

        // Update the label based on selected file(s)
        if (selectedFiles.length > 1) {
            label.innerHTML = `<MdOutlineAttachment/> ${selectedFiles.length} files selected`;
        } else if (selectedFiles.length === 1) {
            label.innerHTML = `<MdOutlineAttachment/> ${selectedFiles[0].name}`; // Display the file name with icon
        } else {
            label.innerHTML = `<MdOutlineAttachment/> Select File`; // Reset to default if no file
        }

        // Handle file state logic (if any)
        // if (selectedFiles.length > 0) {
        //     setFile(selectedFiles); // Assuming setFile is the state setter for file(s)
        // }
    };




    useEffect(() => {
        setApiProps({
            method: 'POST',
            url: 'api/invoices/fileExists',
            postData: {
                invoiceId: id,
            },
            render: (response) => setUploadedFileStatus(response.data),
        });
    }, [id])

    const calltheFileExistsStatus = () => {
        setApiProps({
            method: 'POST',
            url: 'api/invoices/fileExists',
            postData: {
                invoiceId: id,
            },
            render: (response) => setUploadedFileStatus(response.data),
        });
    }


    const onFileUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append("invoiceId", id);
            const url = 'http://vmwhnstemdev01.nadops.net:8080/api/invoices/uploadFile'

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (response.status === 200) {
                    success('File Uploaded Successfully')
                    calltheFileExistsStatus()
                }
                else {
                    const errorData = await response.json(); // Parse response to get the error message
                    const errorMessage = errorData.message;
                    error(errorMessage || 'Failed to upload the file');
                }
            } catch (err) {
                // Handle network or other errors
                error(err);
            }
        } else {
            error('Please upload a valid file.');
        }
    };


    const handleDownload = async (invoiceNumber) => {
        const response = await fetch('http://vmwhnstemdev01.nadops.net:8080/api/invoices/downloadFile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ invoiceId: id }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', invoiceNumber); // You can change the filename here
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } else {
            error(response.data);
        }
    };

    const handleViewTheFile = async () => {
        const response = await fetch('http://vmwhnstemdev01.nadops.net:8080/api/invoices/downloadFile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ invoiceId: id }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPdfBlobUrl(url); // Store the blob URL
            setOpenPDF(true); // Open the PDF modal
        } else {
            error(response);
        }
    }



    const handleDeleteTheFile = async (id) => {
        const response = await fetch(`http://vmwhnstemdev01.nadops.net:8080/api/invoices/deleteFileByInvoiceId/${id}`, {
            method: 'DELETE',
            headers: {
                // 'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
        });
        if (response.ok) {
            success(response.data || 'File Deleted Successfully')
            calltheFileExistsStatus()
        } else {
            error(response.data || 'Failed to Delete File');
        }
    }





    return (
        <div className='file-uploader'>
            {apiProps && <ApiComponent {...apiProps} />}
            {uploadedFileStatus === false ? (
                <>
                    <input
                        id='upload-file'
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className='file-uploader-input'
                        style={{ display: 'none' }} // Hide the default input
                    />
                    <label htmlFor='upload-file' id="file-label">
                        <MdOutlineAttachment /> <span className="file-text">Select File</span>
                    </label>
                    <button
                        type='button'
                        text={<MdOutlineFileUpload />}
                        className='upload-file comment-icon'
                        onClick={onFileUpload}
                        data-tooltip='Upload'
                    ><MdOutlineFileUpload /></button>
                </>
            ) : (
                <>
                    <Button
                        type='button'
                        text='View File'
                        className='pdf-upload-button'
                        onClick={handleViewTheFile}
                    />
                    <button
                        type='button'
                        className="download-button comment-icon"
                        data-tooltip='Download File'
                        onClick={() => setOpenDownloadFile(true)}><LuDownload /></button>

                    <button
                        type='button'
                        className="download-button comment-icon"
                        data-tooltip='Delete File'
                        onClick={() => setOpenDeleteFile(true)}><AiTwotoneDelete /></button>
                </>
            )}
            {openPDF && (
                <Popup
                    isOpen={true}
                    onClose={() => { setOpenPDF(false); setPdfBlobUrl(null) }}
                    specialClass={false}
                >
                    <iframe
                        src={pdfBlobUrl}
                        style={{ width: '600px', height: '800px' }}
                        title="Uploaded PDF"
                    />
                </Popup>
            )}
            {openDownloadFile && (
                <Popup
                    isOpen={true}
                    onClose={() => setOpenDownloadFile(false)}
                >
                    <h6 className='pop-up-text'>Do you want to download <br />the file?</h6>
                    <div className='logout-options'>
                        <Button type='button' className='secondary-buttton-one' text='Yes' onClick={() => { handleDownload(invoiceNumber); setOpenDownloadFile(false) }} />
                        <Button type='button' className='secondary-button-two' text='No' onClick={() => setOpenDownloadFile(false)} />
                    </div>
                </Popup>)}
            {openDeleteFile && (
                <Popup
                    isOpen={true}
                    onClose={() => setOpenDeleteFile(false)}
                >
                    <h6 className='pop-up-text'>Do you want to delete <br />the file?</h6>
                    <div className='logout-options'>
                        <Button type='button' className='secondary-buttton-one' text='Yes' onClick={() => { handleDeleteTheFile(id); setOpenDeleteFile(false) }} />
                        <Button type='button' className='secondary-button-two' text='No' onClick={() => setOpenDeleteFile(false)} />
                    </div>
                </Popup>)}
        </div>
    );
};

export default PdfUploader;
