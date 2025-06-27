import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Button from '../../Components/Button';
import ToastComponent from '../../Components/Toast';

const ScheduleTemplateDownloader = ({ setApiProps }) => {
    const { error } = ToastComponent();
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (employees.length === 0) {
            setApiProps({
                method: 'GET',
                url: 'api/employees/all',
                render: (response) => {
                    if (response && response.data) {

                        const employeeList = response?.data?.employees || response?.data || [];
                        const parsedEmployees = employeeList.map((emp) => ({
                            id: emp.employee_id,
                            name: emp.employee_name,
                        }));
                        setEmployees(parsedEmployees);
                    } else {
                        error('Response or response.data is undefined');
                    }
                }
            });
        }
    }, [error]);


    const handleDownload = () => {
        const today = new Date();
        const dateHeaders = [];

        // Push each date twice (for PICKUP and DROP)
        for (let i = 0; i < 15; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Format date as dd-mm-yyyy with leading zeros
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            const formattedDate = `${day}-${month}-${year}`;

            // Repeat date twice
            dateHeaders.push(formattedDate, formattedDate);
        }

        // Header row 1: Dates repeated twice
        const headerRow1 = ['Employee Id', 'Employee Name', ...dateHeaders];

        // Header row 2: Alternate PICKUP and DROP for each date
        const headerRow2 = ['', '', ...Array(15).fill(['PICKUP', 'DROP']).flat()];

        // Rows with employee data and empty cells for schedule times
        const rows = employees.map(emp => {
            const row = [emp.id, emp.name];
            for (let i = 0; i < 15 * 2; i++) row.push(''); // 15 dates * 2 columns each
            return row;
        });

        const sheetData = [headerRow1, headerRow2, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Template');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'schedule_template.xlsx');
    };


    return (
        <button
            type="button"
            className='notification'
            data-tooltip="Download Template"
            onClick={handleDownload}
            disabled={employees.length === 0}>            
             <img src={process.env.PUBLIC_URL + '/Images/8666778_download_down_save_icon.png'} alt='hughes' style={{width:'20px', height:'20px', backgroundColor:'transparent', border:'none', cursor:'pointer'}}/>
        </button>
        
    );
};

export default ScheduleTemplateDownloader;
