import ExcelJS from 'exceljs';
import { message } from 'antd';
import dayjs from 'dayjs';

const applyHeaderStyle = (cell) => {
  cell.font = {
    name: 'Times New Roman',
    size: 11,
    bold: true
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
};
const calculateConclusionDataForExcel = (data) => {
  if (!data || data.length === 0) {
    return {
      totalCompensation: 0,
      oldPriceDays: 0,
      newPriceDays: 0,
      overallStartDate: null,
      overallEndDate: null,
      oldPriceEndDate: dayjs('2024-10-10'), // Fixed date
      newPriceStartDate: dayjs('2024-10-11') // Fixed date
    };
  }

  let oldPriceDays = 0;
  let newPriceDays = 0;
  let totalCompensation = 0;
  let overallStartDate = dayjs(data[0].startDate);
  let overallEndDate = dayjs(data[data.length - 1].endDate);

  data.forEach(item => {
      const itemCompensationDays = Math.max(0,(item.violationDays || 0) - (item.outageDays || 0));
      totalCompensation += itemCompensationDays;

      if (item.isOldPrice) {
          oldPriceDays += itemCompensationDays;
      } else {
          newPriceDays += itemCompensationDays;
      }
  });

  return {
    totalCompensation,
    oldPriceDays,
    newPriceDays,
    overallStartDate,
    overallEndDate,
    oldPriceEndDate: dayjs('2024-10-10'), // Fixed date
    newPriceStartDate: dayjs('2024-10-11') // Fixed date
  };
};
const applyTitleStyle = (cell, isUnderlined = false) => {
  cell.font = {
    name: 'Times New Roman',
    size: 13,
    bold: true
  };
  if (isUnderlined) {
    cell.font.underline = true;
  }
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  };
};

const applyCellStyle = (cell, isNumber = false, isRed = false) => {
  cell.font = {
    name: 'Times New Roman',
    size: 11,
    color: isRed ? { argb: 'FF0000' } : undefined
  };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: isNumber ? 'center' : 'left',
    wrapText: true
  };
  if (isNumber) {
    cell.numFmt = '0.0';
  }
};

export const exportViolationTimeAgreement = async (data) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('Không có dữ liệu để xuất');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Thỏa thuận thời gian', {
      pageSetup: {
        paperSize: 9,
        orientation: 'portrait',
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3
        }
      }
    });

    // Set column widths
    worksheet.columns = [
      { width: 15 },  // Tháng, năm
      { width: 25 },  // Từ ngày ÷ ngày
      { width: 10 },  // Số ngày
      { width: 12 },  // Số giờ mất điện
      { width: 12 },  // Số ngày bồi thường
      { width: 35 }   // Lý do
    ];

    // Add header section
    const headerSection = [
      { row: 1, cols: ['A1:C1', 'D1:F1'], values: ['CÔNG TY ĐIỆN LỰC THANH HÓA', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'] },
      { row: 2, cols: ['A2:C2', 'D2:F2'], values: ['ĐIỆN LỰC .........', 'Độc lập - Tự do - Hạnh phúc'] }
    ];

    headerSection.forEach(({ row, cols, values }) => {
      cols.forEach((range, index) => {
        worksheet.mergeCells(range);
        const cell = worksheet.getCell(range.split(':')[0]);
        cell.value = values[index];
        applyTitleStyle(cell, row === 2 && index === 1);
      });
    });

    // Add title section
    const titleSection = [
      { row: 4, range: 'A4:F4', text: 'BIÊN BẢN THỎA THUẬN' },
      { row: 5, range: 'A5:F5', text: 'THỜI GIAN BỒI THƯỜNG DO VI PHẠM SỬ DỤNG ĐIỆN' }
    ];

    titleSection.forEach(({ row, range, text }) => {
      worksheet.mergeCells(range);
      const cell = worksheet.getCell(range.split(':')[0]);
      cell.value = text;
      applyTitleStyle(cell);
    });

    // Add legal basis section

  const legalBasis = [
    "Căn cứ Điều 21 - Phương pháp xác định số tiền trộm cắp điện từ sản lượng điện năng trộm cắp -\n" +
    "Chương IV và Phụ lục số II - Thông tư số: 42/TT-BCT ngày 30/12/2022\n" +
    "Quy định về kiểm tra hoạt động Điện lực và sử dụng điện,\n" +
    "giải quyết tranh chấp hợp đồng mua bán điện.",
  
    "Căn cứ Biên bản kiểm tra sử dụng điện số: ....../BB-KTSDD, ngày 05/1/2025.\n" +
    "Với kết luận kiểm tra ghi nhận hình thức vi phạm: Trộm cắp điện, đã được các bên ký nhận.",
  
    "Căn cứ thời gian mất điện được ghi nhận trên Hệ thống quản lý\n" +
    "Quản lý thông tin mất điện OMS của Điện lực ......,\n" +
    "trực thuộc Công ty Điện lực Thanh Hóa."
  ];
    
  legalBasis.forEach((text, index) => {
    const row = 7 + index;
    worksheet.mergeCells(`A${row}:F${row}`);
    const cell = worksheet.getCell(`A${row}`);
    cell.value = text;
    cell.font = { name: "Times New Roman", size: 11 };
    cell.alignment = { wrapText: true, vertical: "top", horizontal: "left" };
  
    // Tính chiều cao dựa trên số dòng trong nội dung
    const lineCount = text.split("\n").length; // Đếm số dòng trong ô
    worksheet.getRow(row).height = 15 * lineCount; // 15 là chiều cao mặc định của 1 dòng
  });


    // Add meeting date
    worksheet.mergeCells('A11:F11');
    const meetingDate = worksheet.getCell('A11');
    meetingDate.value = 'Hôm nay, ngày ...../...../2025, chúng tôi gồm';
    meetingDate.font = { name: 'Times New Roman', size: 11 };
    meetingDate.alignment = { horizontal: 'center' };

    // Add representatives section
    const representatives = [
      { row: 13, text: 'I. ĐẠI DIỆN BÊN BÁN ĐIỆN - ĐIỆN LỰC..........', bold: true },
      { row: 14, text: 'Ông:.................................................' },
      { row: 15, text: 'Ông:.................................................' },
      { row: 17, text: 'II. ĐẠI DIỆN BÊN MUA ĐIỆN', bold: true },
      { row: 18, text: 'Ông:.................................................' },
      { row: 19, text: 'Số CCCD: .........................................' },
      { row: 20, text: 'Mã khách hàng: PA07.....................' },
      { row: 21, text: 'Địa chỉ dùng điện: .........................' }
    ];

    representatives.forEach(({ row, text, bold }) => {
      worksheet.mergeCells(`A${row}:F${row}`);
      const cell = worksheet.getCell(`A${row}`);
      cell.value = text;
      cell.font = { name: 'Times New Roman', size: 11, bold };
    });

    // Add agreement title
    worksheet.mergeCells('A23:F23');
    const agreementTitle = worksheet.getCell('A23');
    agreementTitle.value = 'Hai bên thỏa thuận thời gian vi phạm và thời gian sử dụng thiết bị như sau';
    agreementTitle.font = { name: 'Times New Roman', size: 11, bold: true };
    agreementTitle.alignment = { horizontal: 'center' };

    // Add violation period section
    worksheet.mergeCells('A24:F24');
    const violationPeriod = worksheet.getCell('A24');
    violationPeriod.value = '1. Số ngày vi phạm trong năm:';
    violationPeriod.font = { name: 'Times New Roman', size: 11, bold: true };

    // Calculate total violation days and outage days
    const totalViolationDays = data.reduce((sum, period) => sum + (period.violationDays || 0), 0);
    const totalOutageDays = data.reduce((sum, period) => sum + (period.outageDays || 0), 0);
    const firstPeriod = data[0];
    const lastPeriod = data[data.length - 1];

    worksheet.mergeCells('A25:F25');
    const periodSummary = worksheet.getCell('A25');
    periodSummary.value = `Số ngày vi phạm: Từ ngày ${dayjs(firstPeriod.startDate).format('D/M/YYYY')} đến ngày ${dayjs(lastPeriod.endDate).format('D/M/YYYY')} bằng ${totalViolationDays} ngày`;
    periodSummary.font = { name: 'Times New Roman', size: 11 };

    worksheet.mergeCells('A26:F26');
    const outageSummary = worksheet.getCell('A26');
    outageSummary.value = `Số ngày mất điện trong thời gian vi phạm là: ${totalOutageDays.toFixed(1)} ngày, trong đó: 02 ngày mất điện có kế hoạch do sửa chữa, cải tạo lưới điện; 01 ngày do............................ và 0.5 ngày do.......................................................`;
    outageSummary.font = { name: 'Times New Roman', size: 11 };

    // Add table headers
    const tableHeaders = [
      { cell: 'A28', text: 'Tháng, năm', rowspan: 2 },
      { cell: 'B28', text: 'Số ngày vi phạm trong kỳ (ngày)', colspan: 2 },
      { cell: 'D28', text: 'Số giờ mất điện trong kỳ (ngày)', rowspan: 2 },
      { cell: 'E28', text: 'Số ngày bồi thường trong kỳ (ngày)', rowspan: 2 },
      { cell: 'F28', text: 'Lý do', rowspan: 2 }
    ];

    // Set row heights for header rows
    worksheet.getRow(28).height = 35; // First header row
    worksheet.getRow(29).height = 35; // Second header row

    tableHeaders.forEach(({ cell, text, rowspan, colspan }) => {
      if (rowspan) {
        worksheet.mergeCells(`${cell}:${cell.replace(/\d+/, n => String(Number(n) + 1))}`);
      }
      if (colspan) {
        worksheet.mergeCells(`${cell}:${String.fromCharCode(cell.charCodeAt(0) + colspan - 1)}${cell.slice(1)}`);
      }
      const headerCell = worksheet.getCell(cell);
      headerCell.value = text;
      applyHeaderStyle(headerCell);
    });

    // Add sub-headers for date range
    const subHeaders = [
      { cell: 'B29', text: 'Từ ngày ÷ ngày' },
      { cell: 'C29', text: 'Số ngày' }
    ];

    subHeaders.forEach(({ cell, text }) => {
      const headerCell = worksheet.getCell(cell);
      headerCell.value = text;
      applyHeaderStyle(headerCell);
    });

    // Add data rows
    let rowIndex = 30;
    data.forEach(period => {
      const row = worksheet.getRow(rowIndex);
      
      const startDate = dayjs(period.startDate).format('D/M/YYYY');
      const endDate = dayjs(period.endDate).format('D/M/YYYY');
      const compensationDays = (period.violationDays || 0) - (period.outageDays || 0);

      const isOctober2024 = period.month === 10 && period.year === 2024;
      const monthLabel = isOctober2024
        ? `Tháng ${period.month}/${period.year} (${dayjs(period.startDate).date() === 1 ? '1-10' : '11-31'})`
        : `Tháng ${period.month}/${period.year}`;

      const cells = [
        { value: monthLabel, isRed: isOctober2024 },
        { value: `${startDate} ÷ ${endDate}`, isRed: isOctober2024 },
        { value: period.violationDays, isNumber: true, isRed: isOctober2024 },
        { value: period.outageDays, isNumber: true, isRed: isOctober2024 },
        { value: compensationDays, isNumber: true, isRed: isOctober2024 },
        { value: period.reason || '', isRed: isOctober2024 }
      ];

      cells.forEach((cell, index) => {
        const excelCell = row.getCell(index + 1);
        excelCell.value = cell.value;
        applyCellStyle(excelCell, cell.isNumber, cell.isRed);
      });

      rowIndex++;
    });

    // Add total row
    const totalRow = worksheet.getRow(rowIndex);
    const totals = data.reduce((acc, period) => ({
      violationDays: acc.violationDays + (period.violationDays || 0),
      outageDays: acc.outageDays + (period.outageDays || 0),
      compensationDays: acc.compensationDays + ((period.violationDays || 0) - (period.outageDays || 0))
    }), { violationDays: 0, outageDays: 0, compensationDays: 0 });

    const totalCells = [
      { value: 'Cộng', bold: true },
      { value: '' },
      { value: totals.violationDays, isNumber: true },
      { value: totals.outageDays, isNumber: true },
      { value: totals.compensationDays, isNumber: true },
      { value: '' }
    ];

    totalCells.forEach((cell, index) => {
      const excelCell = totalRow.getCell(index + 1);
      excelCell.value = cell.value;
      applyCellStyle(excelCell, cell.isNumber);
      if (cell.bold) {
        excelCell.font.bold = true;
      }
    });

    // Add conclusion
    // --- Add Conclusion Section ---
    let conclusionRowIndex = rowIndex + 1; // Start conclusion right after total row
    const conclusionData = calculateConclusionDataForExcel(data);

    // Row 1: Tổng số ngày
    worksheet.mergeCells(`A${conclusionRowIndex}:D${conclusionRowIndex}`); // Merge A to D
    const conclusionTotalCellLabel = worksheet.getCell(`A${conclusionRowIndex}`);
    conclusionTotalCellLabel.value = 'Kết luận: Số ngày bồi thường trong thời gian vi phạm là:';
    conclusionTotalCellLabel.font = { name: 'Times New Roman', size: 11, bold: true };
    conclusionTotalCellLabel.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells(`E${conclusionRowIndex}:F${conclusionRowIndex}`); // Merge E to F
    const conclusionTotalCellValue = worksheet.getCell(`E${conclusionRowIndex}`);
    conclusionTotalCellValue.value = `${conclusionData.totalCompensation.toFixed(1)} ngày`;
    conclusionTotalCellValue.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFF0000'} }; // Red color
    conclusionTotalCellValue.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(conclusionRowIndex).height = 20;

    // Row 2: Giá cũ
    conclusionRowIndex++;
    worksheet.mergeCells(`A${conclusionRowIndex}:D${conclusionRowIndex}`);
    const conclusionOldPriceLabel = worksheet.getCell(`A${conclusionRowIndex}`);
    conclusionOldPriceLabel.value = `   1. Số ngày SDĐ theo giá cũ (Từ ${conclusionData.overallStartDate.format('DD/MM/YYYY')} ÷ ${conclusionData.oldPriceEndDate.format('DD/MM/YYYY')})`;
    conclusionOldPriceLabel.font = { name: 'Times New Roman', size: 11 };
    conclusionOldPriceLabel.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells(`E${conclusionRowIndex}:F${conclusionRowIndex}`);
    const conclusionOldPriceValue = worksheet.getCell(`E${conclusionRowIndex}`);
    conclusionOldPriceValue.value = `${conclusionData.oldPriceDays.toFixed(1)} ngày`;
    conclusionOldPriceValue.font = { name: 'Times New Roman', size: 11, bold: true };
    conclusionOldPriceValue.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(conclusionRowIndex).height = 20;

    // Row 3: Giá mới
    conclusionRowIndex++;
    worksheet.mergeCells(`A${conclusionRowIndex}:D${conclusionRowIndex}`);
    const conclusionNewPriceLabel = worksheet.getCell(`A${conclusionRowIndex}`);
    conclusionNewPriceLabel.value = `   2. Số ngày SDĐ theo giá bán điện mới (Từ ${conclusionData.newPriceStartDate.format('DD/MM/YYYY')} ÷ ${conclusionData.overallEndDate.format('DD/MM/YYYY')})`;
    conclusionNewPriceLabel.font = { name: 'Times New Roman', size: 11 };
    conclusionNewPriceLabel.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells(`E${conclusionRowIndex}:F${conclusionRowIndex}`);
    const conclusionNewPriceValue = worksheet.getCell(`E${conclusionRowIndex}`);
    conclusionNewPriceValue.value = `${conclusionData.newPriceDays.toFixed(1)} ngày`;
    conclusionNewPriceValue.font = { name: 'Times New Roman', size: 11, bold: true };
    conclusionNewPriceValue.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(conclusionRowIndex).height = 20;
    // --- End Conclusion Section ---

    // Add device usage period section (adjust row index)
    let usagePeriodRow = conclusionRowIndex + 2; // Start after conclusion
    worksheet.mergeCells(`A${usagePeriodRow}:F${usagePeriodRow}`);
    const usagePeriod = worksheet.getCell(`A${usagePeriodRow}`);
    usagePeriod.value = '2. Thời gian sử dụng thiết bị trong thời gian vi phạm';
    usagePeriod.font = { name: 'Times New Roman', size: 11, bold: true };


    // Add usage details
    const usageDetails = [
      '- Số giờ sử dụng của các thiết bị trong ngày được quy định tại: Cột số 1 (Sinh hoạt gia đình) Phụ lục số II- Bảng thời gian áp dụng trong tính toán xử lý vi phạm sử dụng điện (Bao gồm cả hành vi trộm cắp điện) - Thông tư 42',
      '- Thời gian sử dụng của: Điều hòa 1 chiều, Quạt hơi nước được thống nhất ≥ 6 tháng trong năm từ tháng 3÷.... hàng năm',
      '- Thời gian sử dụng của: Quạt mát được thống nhất ≥ 9 tháng trong năm từ tháng 3÷11 hàng năm',
      '- Thời gian sử dụng của: Bình nóng lạnh được thống nhất ≥ 9 tháng trong năm từ tháng 8÷4 năm sau',
      '- Thời gian sử dụng của: Điều hòa 2 chiều, quạt thông gió và các thiết bị thiết yếu khác sử dụng được tính là 12 tháng trong năm'
    ];

    let currentRow = usagePeriodRow + 1;
    usageDetails.forEach(detail => {
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const cell = worksheet.getCell(`A${currentRow}`);
      cell.value = detail;
      cell.font = { name: 'Times New Roman', size: 11 };
      cell.alignment = { wrapText: true };
      currentRow++;
    });

    // Add agreement text
    const agreementRow = currentRow + 1;
    worksheet.mergeCells(`A${agreementRow}:F${agreementRow}`);
    const agreement = worksheet.getCell(`A${agreementRow}`);
    agreement.value = 'Hai bên thống nhất số ngày và thời gian sử dụng của các thiết bị như nội dung trên';
    agreement.font = { name: 'Times New Roman', size: 11 };
    agreement.alignment = { horizontal: 'center' };

    // Add document copies text
    const copiesRow = agreementRow + 1;
    worksheet.mergeCells(`A${copiesRow}:F${copiesRow}`);
    const copies = worksheet.getCell(`A${copiesRow}`);
    copies.value = 'Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, Điện lực .... giữ 01 bản, hộ vi phạm Ông Nguyễn Văn B giữ 01 bản./.';
    copies.font = { name: 'Times New Roman', size: 11 };

    // Add signature section
    const signatureRow = copiesRow + 2;
    worksheet.mergeCells(`D${signatureRow}:F${signatureRow}`);
    const dateCell = worksheet.getCell(`D${signatureRow}`);
    dateCell.value = '............... ngày ..... tháng 03 năm 2025';
    dateCell.font = { name: 'Times New Roman', size: 11 };
    dateCell.alignment = { horizontal: 'center' };

    const signatures = [
      { row: signatureRow + 2, text1: 'ĐẠI DIỆN', text2: 'ĐẠI DIỆN' },
      { row: signatureRow + 3, text1: 'BÊN MUA ĐIỆN', text2: 'BÊN BÁN ĐIỆN' },
      { row: signatureRow + 4, text1: '(Ký ghi rõ họ tên)', text2: '(Ký tên, đóng dấu)' }
    ];

    signatures.forEach(({ row, text1, text2 }) => {
      worksheet.mergeCells(`A${row}:B${row}`);
      worksheet.mergeCells(`E${row}:F${row}`);
      
      const cell1 = worksheet.getCell(`A${row}`);
      const cell2 = worksheet.getCell(`E${row}`);
      
      cell1.value = text1;
      cell2.value = text2;
      
      [cell1, cell2].forEach(cell => {
        cell.font = {
          name: 'Times New Roman',
          size: 11,
          bold: row <= signatureRow + 3
        };
        cell.alignment = { horizontal: 'center' };
      });
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Thỏa thuận thời gian VP ${dayjs().format('DD-MM-YYYY')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    message.success('Xuất biên bản thỏa thuận thành công');
  } catch (error) {
    console.error('Lỗi khi xuất biên bản thỏa thuận:', error);
    throw error;
  }
};

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
            let month, year, dateRange;
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