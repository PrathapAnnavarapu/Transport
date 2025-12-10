import React, { useEffect, useState } from 'react'
import EmployeeDetails from './AddEmployeeDetails'
import Button from '../../Components/Button';
import ApiComponent from '../../Components/API'
import ToastComponent from '../../Components/Toast';



const CreateEmployee = () => {   
    const { info, error, success } = ToastComponent();
    const [file, setFile] = useState(null);
    const [apiProps, setApiProps] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);        
    };

    
    const handleUpload = async () => {
        if (!file) {
            error('Please select a file');
            return;
        }

        // Check if the file is Excel or CSV
        const validFileTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];

        if (!validFileTypes.includes(file.type)) {
            error('Please upload a valid Excel (.xls, .xlsx) or CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Set API Props for file upload using setApiProps
        setApiProps({
            method: 'POST',
            url: 'api/upload/employees',  // Endpoint for file upload
            postData: formData,           
            render: (response) => {
                success(response.data.message || 'File uploaded successfully');
            },
            catchError: (error) => {
                error(error.response?.data?.error || 'Upload failed');
            },
        });
    };


    return (
        <div className='create-invoice'>
             {apiProps && <ApiComponent {...apiProps} />}
            <div className='operations-bar'>               
                <div>
                <input type="file" accept=".xls,.xlsx,.csv"  onChange={handleFileChange}/>
                <Button type="button" text='upload' onClick={handleUpload} className='primary-button'/>
                </div>
            </div>
            <div className='employee-tabs-container'>
               <EmployeeDetails/>
            </div>
        </div>
    )
}

export default React.memo(CreateEmployee)