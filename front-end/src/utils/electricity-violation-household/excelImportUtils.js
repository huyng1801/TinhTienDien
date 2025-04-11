import ExcelJS from 'exceljs';
import { message } from 'antd';
import dayjs from 'dayjs';

export const importViolationTimeAgreement = async () => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    
    return new Promise((resolve, reject) => {
      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          if (!file) {
            message.warning('Không có file được chọn');
            resolve(null);
            return;
          }

          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(await file.arrayBuffer());
          
          const worksheet = workbook.getWorksheet(1);
          if (!worksheet) {
            message.warning('File Excel không có dữ liệu');
            resolve(null);
            return;
          }

          // Find the table start row (where the data begins)
          let tableStartRow = 28; // Default header row
          let dataStartRow = 30; // Default data start row
          const data = [];

          // Process each row
          for (let rowNumber = dataStartRow; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            
            // Get cell values
            const monthYearCell = row.getCell(1).value;
            if (!monthYearCell || monthYearCell === 'Cộng') break;

            // Parse month and year
            let month, year;
            const monthYearMatch = monthYearCell.toString().match(/Tháng (\d+)\/(\d+)(?:\s*\(([^)]+)\))?/);
            
            if (monthYearMatch) {
              month = parseInt(monthYearMatch[1]);
              year = parseInt(monthYearMatch[2]);
              
              // Get date range
              const dateRangeCell = row.getCell(2).value;
              if (dateRangeCell) {
                const dates = dateRangeCell.toString().split('÷').map(d => {
                  const [day, month, year] = d.trim().split('/').map(Number);
                  return new Date(year, month - 1, day);
                });

                // Get violation days, outage days, and reason
                const violationDays = parseFloat(row.getCell(3).value) || 0;
                const outageDays = parseFloat(row.getCell(4).value) || 0;
                const reason = row.getCell(6).value || '';

                data.push({
                  month,
                  year,
                  startDate: dates[0],
                  endDate: dates[1],
                  violationDays,
                  outageDays,
                  reason,
                  key: month === 10 && year === 2024 
                    ? `${month}-${year}-${dayjs(dates[0]).date() === 1 ? '1' : '2'}`
                    : `${month}-${year}`
                });
              }
            }
          }

          // Sort data by date
          data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

          if (data.length === 0) {
            message.warning('Không tìm thấy dữ liệu hợp lệ trong file');
            resolve(null);
            return;
          }

          message.success('Nhập dữ liệu từ Excel thành công');
          resolve(data);
        } catch (error) {
          console.error('Lỗi khi đọc file Excel:', error);
          message.error('Có lỗi xảy ra khi đọc file Excel: ' + error.message);
          reject(error);
        }
      };

      input.click();
    });
  } catch (error) {
    console.error('Lỗi khi nhập file Excel:', error);
    throw error;
  }
};