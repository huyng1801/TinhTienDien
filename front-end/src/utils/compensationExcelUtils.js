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
  
  // Set alignment - right align for numbers, left align for text
  cell.alignment = {
    vertical: 'middle',
    horizontal: isNumber ? 'right' : 'left',
    wrapText: true
  };

  // Set number format based on the value
  if (isNumber && cell.value !== null && cell.value !== undefined) {
    if (Number.isInteger(cell.value)) {
      cell.numFmt = '0'; // Integer format
    } else {
      cell.numFmt = '0.0'; // 1 decimal place
    }
  }
};

export const exportCompensationCalculation = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bảng tính ĐN, TĐ - SHBT', {
      pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
        fitToPage: true
      }
    });

    // Set column widths
    worksheet.columns = [
      { width: 5 },   // STT
      { width: 25 },  // Tên thiết bị
      { width: 10 },  // Số lượng
      { width: 10 },  // Công suất
      { width: 10 },  // Hệ số Cosφ
      { width: 12 },  // Số giờ SD/ngày
      { width: 12 },  // Số ngày SD/kỳ
      { width: 12 },  // ĐN SD trong kỳ
      { width: 10 },  // Biểu giá
      { width: 12 },  // ĐN đã phát hành
      { width: 12 },  // ĐN bồi thường
      { width: 12 },  // Giá bán điện
      { width: 15 }   // Thành tiền
    ];

    // Add header section
    const headerSection = [
      { row: 1, cols: ['A1:C1', 'D1:M1'], values: ['CÔNG TY ĐIỆN LỰC THANH HÓA', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'] },
      { row: 2, cols: ['A2:C2', 'D2:M2'], values: ['ĐIỆN LỰC A', 'Độc lập - Tự do - Hạnh phúc'] }
    ];

    headerSection.forEach(({ row, cols, values }) => {
      cols.forEach((range, index) => {
        worksheet.mergeCells(range);
        const cell = worksheet.getCell(range.split(':')[0]);
        cell.value = values[index];
        cell.font = { name: 'Times New Roman', size: 13, bold: true };
        cell.alignment = { horizontal: 'center' };
      });
    });

    // Add title
    worksheet.mergeCells('A4:M4');
    const titleCell = worksheet.getCell('A4');
    titleCell.value = 'BIÊN BẢN TÍNH';
    titleCell.font = { name: 'Times New Roman', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A5:M5');
    const subtitleCell = worksheet.getCell('A5');
    subtitleCell.value = 'ĐIỆN NĂNG, TIỀN ĐIỆN BỒI THƯỜNG DO VI PHẠM SỬ DỤNG ĐIỆN';
    subtitleCell.font = { name: 'Times New Roman', size: 14, bold: true };
    subtitleCell.alignment = { horizontal: 'center' };

    // Add legal basis section
    const legalBasis = [
      '- Căn cứ Luật Điện lực số: 28/2004/QH11, ngày 03/12/2004, Luật sửa đổi bổ sung một số điều của Luật Điện lực ngày 20 tháng 11 năm 2012',
      '- Căn cứ Điều 21 Chương IV và Phụ lục số II -Thông tư 42/2022/TT-BCT ngày 30/12/2022 Quy định về kiểm tra hoạt động điện lực và sử dụng điện, giải quyết tranh chấp HĐMBĐ',
      '- Căn cứ Hợp đồng mua bán điện số: ............ Ký ngày ...../.../..... Giữa Giám đốc Điện lực A và Ông Nguyễn Văn B',
      '- Căn cứ biên bản kiểm tra số: ....../BB -KTSDD ngày 04/03/2025 xác định hộ ông Nguyễn Văn B vi phạm khoản 6 điều 7 Luật Điện lực (trộm cắp điện)',
      '- Căn cứ Biên bản thỏa thuận thời gian bồi thường do vi phạm sử dụng điện'
    ];

    legalBasis.forEach((text, index) => {
      worksheet.mergeCells(`A${7 + index}:M${7 + index}`);
      const cell = worksheet.getCell(`A${7 + index}`);
      cell.value = text;
      cell.font = { name: 'Times New Roman', size: 11 };
    });

    // Add meeting date
    worksheet.mergeCells('A13:M13');
    const meetingDate = worksheet.getCell('A13');
    meetingDate.value = 'Hôm nay, ngày ..... tháng 03 năm 2025, tại Điện lực A chúng tôi gồm';
    meetingDate.font = { name: 'Times New Roman', size: 11 };
    meetingDate.alignment = { horizontal: 'center' };

    // Add representatives section
    const representatives = [
      { row: 15, text: 'I-ĐẠI DIỆN BÊN BÁN ĐIỆN-ĐIỆN LỰC A', bold: true },
      { row: 16, text: 'Ông : Nguyễn Văn A                                                                  Chức vụ : Giám đốc' },
      { row: 17, text: 'Ông : Nguyễn Văn                                                                    Chức vụ : Kiểm tra viên điện lực' },
      { row: 19, text: 'II-ĐẠI DIỆN BÊN MUA ĐIỆN', bold: true },
      { row: 20, text: 'Ông: Nguyễn Văn B                                                                   Chức vụ : Chủ hợp đồng mua bán điện' },
      { row: 21, text: 'Số CCCD: 038........                                                                Ngày cấp                Nơi cấp' },
      { row: 22, text: 'Mã khách hàng: PA07......' },
      { row: 23, text: 'Địa chỉ mua điện:..........' }
    ];

    representatives.forEach(({ row, text, bold }) => {
      worksheet.mergeCells(`A${row}:M${row}`);
      const cell = worksheet.getCell(`A${row}`);
      cell.value = text;
      cell.font = { name: 'Times New Roman', size: 11, bold };
    });

    // Add agreement text
    worksheet.mergeCells('A25:M25');
    const agreement = worksheet.getCell('A25');
    agreement.value = 'Hai bên thống nhất thỏa thuận điện năng, tiền điện bồi thường do vi phạm sử dụng điện như sau:';
    agreement.font = { name: 'Times New Roman', size: 11 };

    // Add period information
    const periodInfo = [
      '- Thời gian tính bồi thường được xác định từ ngày : 5/3/2024÷ 4/3/2025',
      '- Số ngày mất điện : 3,5 ngày; số ngày bồi thường (đã trừ đi số ngày mất điện) : 361,5 ngày được xác định tại Biên bản thỏa thuận thời gian bồi thường do vi phạm sử',
      '- Từ tháng 3/2024÷3/2025 ghi chữ ngày cuối tháng'
    ];

    periodInfo.forEach((text, index) => {
      worksheet.mergeCells(`A${26 + index}:M${26 + index}`);
      const cell = worksheet.getCell(`A${26 + index}`);
      cell.value = text;
      cell.font = { name: 'Times New Roman', size: 11 };
    });

    // Add calculation title
    worksheet.mergeCells('A30:M30');
    const calcTitle = worksheet.getCell('A30');
    calcTitle.value = 'III. Bảng tính toán xác định điện năng, tiền điện bồi thường';
    calcTitle.font = { name: 'Times New Roman', size: 11, bold: true };

    // Add table headers
    const headers = [
      'Thứ tự',
      'Tên thiết bị',
      'Số lượng',
      'Công suất (kW)',
      'Hệ số Cosφ',
      'Số giờ sử dụng trong ngày',
      'Số ngày sử dụng trong kỳ',
      'Điện năng sử dụng trong kỳ',
      'Biểu giá',
      'ĐN đã phát hành',
      'ĐN bồi thường',
      'Giá bán điện',
      'Thành tiền'
    ];

    const headerRow = worksheet.getRow(32);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      applyHeaderStyle(cell);
    });

    // Add data for each period
    let currentRow = 33;
    let totalPowerUsage = 0;
    let totalAmount = 0;
    let oldPriceTotal = 0;
    let newPriceTotal = 0;

    data.periods.forEach(period => {
      // Add period header
      const periodRow = worksheet.getRow(currentRow);
      const periodCell = periodRow.getCell(1);
      periodCell.value = `Tháng ${period.period.month}/${period.period.year}${
        period.period.month === 10 && period.period.year === 2024
          ? ` (${dayjs(period.period.startDate).format('DD/MM')} - ${dayjs(period.period.endDate).format('DD/MM')})`
          : ''
      }`;
      worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
      periodCell.font = { name: 'Times New Roman', size: 11, bold: true };
      currentRow++;

      // Add devices
      period.devices.forEach((device, index) => {
        const row = worksheet.getRow(currentRow);
        
        const cells = [
          { value: index + 1 },
          { value: device.name },
          { value: device.quantity },
          { value: device.power },
          { value: device.cosPhi },
          { value: device.hoursPerDay },
          { value: device.daysPerPeriod },
          { value: device.powerUsage },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' },
          { value: '' }
        ];

        cells.forEach((cell, cellIndex) => {
          const excelCell = row.getCell(cellIndex + 1);
          excelCell.value = cell.value;
          applyCellStyle(excelCell, cellIndex > 1);
        });

        currentRow++;
      });

      // Add electricity usage distribution by levels
      const distribution = period.distribution;
      const levels = [
        { key: 'bac1', label: 'Bậc 1' },
        { key: 'bac2', label: 'Bậc 2' },
        { key: 'bac3', label: 'Bậc 3' },
        { key: 'bac4', label: 'Bậc 4' },
        { key: 'bac5', label: 'Bậc 5' },
        { key: 'bac6', label: 'Bậc 6' }
      ];

      levels.forEach((level, index) => {
        const row = worksheet.getRow(currentRow + index);
        
        // Clear previous values
        for (let i = 1; i <= 13; i++) {
          const cell = row.getCell(i);
          cell.value = '';
          applyCellStyle(cell);
        }

        // Level label (Biểu giá)
        row.getCell(9).value = level.label;
        applyCellStyle(row.getCell(9), false, true);
        
        // Paid amount (ĐN đã phát hành)
        row.getCell(10).value = distribution.paid[level.key];
        applyCellStyle(row.getCell(10), true, true);
        
        // Compensation amount (ĐN bồi thường)
        row.getCell(11).value = distribution.compensation[level.key];
        applyCellStyle(row.getCell(11), true, true);
        
        // Price (Giá bán điện)
        const price = period.pricePeriod === 'AFTER_OCT_2024'
          ? data.prices.AFTER_OCT_2024[index]
          : data.prices.NOV_2023_TO_OCT_2024[index];
        row.getCell(12).value = price;
        applyCellStyle(row.getCell(12), true, true);
        
        // Total amount (Thành tiền)
        const total = distribution.compensation[level.key] * price;
        row.getCell(13).value = total;
        applyCellStyle(row.getCell(13), true, true);

        // Update totals
        if (period.pricePeriod === 'AFTER_OCT_2024') {
          newPriceTotal += total;
        } else {
          oldPriceTotal += total;
        }
        totalAmount += total;
  
      });

      currentRow += 6; // Move past the 6 levels

      // Add period total row after the levels
      const totalRow = worksheet.getRow(currentRow);
      totalRow.getCell(1).value = 'Cộng';
      worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
      
      // Set total power usage
      totalRow.getCell(8).value = period.totalPowerUsage;
      
      // Set total paid and compensation amounts
      totalRow.getCell(10).value = Object.values(distribution.paid).reduce((sum, val) => sum + val, 0);
      totalRow.getCell(11).value = Object.values(distribution.compensation).reduce((sum, val) => sum + val, 0);
      totalRow.getCell(13).value = totalAmount;

      totalRow.getCell(14).value = Object.values(distribution.compensation).reduce((sum, val) => sum + val, 0);
      
      // Format total row cells
      for (let i = 1; i <= 13; i++) {
        const cell = totalRow.getCell(i);
        applyCellStyle(cell, i >= 8, true);
        if (i === 1) {
          cell.font.bold = true;
        }
      }

      currentRow += 2; // Add space after the total row
      totalPowerUsage += period.totalPowerUsage;
    });

    // Add grand total
    const grandTotalRow = worksheet.getRow(currentRow);
    grandTotalRow.getCell(1).value = 'Tổng cộng các kỳ';
    grandTotalRow.getCell(8).value = totalPowerUsage;
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    applyCellStyle(grandTotalRow.getCell(1), false, true);
    applyCellStyle(grandTotalRow.getCell(8), true);
    
    currentRow += 2;

    // Add price breakdown sections
    const priceBreakdown = [
      { title: '1. Điện năng, tiền điện bồi thường giá cũ', total: oldPriceTotal },
      { title: '2. Điện năng, tiền điện bồi thường giá mới', total: newPriceTotal }
    ];

    priceBreakdown.forEach(({ title, total }) => {
      const titleRow = worksheet.getRow(currentRow);
      titleRow.getCell(1).value = title;
      worksheet.mergeCells(`A${currentRow}:M${currentRow}`); // Gộp tiêu đề toàn bộ dòng
      titleRow.getCell(1).font = { name: 'Times New Roman', size: 11, bold: true };
      currentRow++;
    
      for (let i = 0; i < 6; i++) {
        const row = worksheet.getRow(currentRow);
        
        // Gộp ô từ A đến D cho "Điện năng bậc x"
        worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
        row.getCell(1).value = `Điện năng bậc ${i + 1}`;
        
        row.getCell(12).value = data.prices.BEFORE_NOV_2023[i];
        row.getCell(13).value = total;
    
        // Áp dụng style
        applyCellStyle(row.getCell(1)); // Gộp ô, vẫn style vào cột đầu
        applyCellStyle(row.getCell(12), true);
        applyCellStyle(row.getCell(13), true);
        
        currentRow++;
      }
    });


    // Add final totals
    const grandTotal = oldPriceTotal + newPriceTotal;
    const vat = grandTotal * 0.08;
    
    const finalTotals = [
      { text: 'Tổng cộng: 3 =1+2', value: grandTotal },
      { text: 'Điện năng bồi thường (Lấy làm tròn)', value: totalPowerUsage, unit: 'kWh' },
      { text: 'Tiền điện bồi thường', value: grandTotal, unit: 'đồng' },
      { text: 'Thuế VAT 8%', value: vat, unit: 'đồng' },
      { text: 'Tổng tiền điện bồi thường (Lấy làm tròn)', value: grandTotal + vat, unit: 'đồng' }
    ];

    finalTotals.forEach(({ text, value, unit }) => {
      const row = worksheet.getRow(currentRow);
      row.getCell(1).value = text;
      row.getCell(13).value = value;
      if (unit) {
        row.getCell(14).value = unit;
      }
      worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
      applyCellStyle(row.getCell(1));
      applyCellStyle(row.getCell(13), true);

      // Add the difference between total power usage and paid power usage
      if (text === 'Điện năng bồi thường (Lấy làm tròn)') {
        const totalPaid = data.periods.reduce((sum, period) => 
          sum + Object.values(period.distribution.paid).reduce((a, b) => a + b, 0), 0);
        const difference = totalPowerUsage - totalPaid;
        row.getCell(13).value = difference;
        applyCellStyle(row.getCell(13), true);
      }
      
      currentRow++;
    });

    // Add footer
    currentRow += 2;
    const footerRow = worksheet.getRow(currentRow);
    footerRow.getCell(1).value = 'Biên bản này là 1 phần không thể tách rời của Biên bản thỏa thuận bồi thường điện năng, tiền điện do vi phạm sử dụng điện';
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    footerRow.getCell(1).font = { name: 'Times New Roman', size: 11 };

    // Add signature section
    currentRow += 2;
    worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
    const dateCell = worksheet.getCell(`H${currentRow}`);
    dateCell.value = 'Ngày ..... tháng 03 năm 2025';
    dateCell.font = { name: 'Times New Roman', size: 11 };
    dateCell.alignment = { horizontal: 'center' };

    currentRow += 2;
    const signatures = [
      { text1: 'ĐẠI DIỆN', text2: 'ĐẠI DIỆN' },
      { text1: 'BÊN MUA ĐIỆN', text2: 'BÊN BÁN ĐIỆN' },
      { text1: '(Ký ghi rõ họ tên)', text2: '(Ký tên, đóng dấu)' }
    ];

    signatures.forEach(({ text1, text2 }) => {
      const row = worksheet.getRow(currentRow);
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      worksheet.mergeCells(`H${currentRow}:M${currentRow}`);
      
      const cell1 = row.getCell(1);
      const cell2 = row.getCell(8);
      
      cell1.value = text1;
      cell2.value = text2;
      
      [cell1, cell2].forEach(cell => {
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.alignment = { horizontal: 'center' };
      });
      
      currentRow++;
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Biên bản tính điện năng bồi thường ${dayjs().format('DD-MM-YYYY')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    message.success('Xuất biên bản tính điện năng bồi thường thành công');
  } catch (error) {
    console.error('Lỗi khi xuất biên bản tính điện năng bồi thường:', error);
    message.error('Có lỗi xảy ra khi xuất biên bản tính điện năng bồi thường');
  }
};