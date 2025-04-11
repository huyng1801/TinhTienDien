// src/utils/detailedCalculationExcelUtils.js
import ExcelJS from 'exceljs';
import { message } from 'antd';
import dayjs from 'dayjs';

const applyHeaderStyle = (cell, options = {}) => {
  const { bold = true, size = 11, center = true, yellow = false } = options;
  
  cell.font = {
    name: 'Times New Roman',
    size,
    bold
  };
  
  cell.alignment = {
    vertical: 'middle',
    horizontal: center ? 'center' : 'left',
    wrapText: true
  };
  
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  if (yellow) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }
    };
  }
};

const applyCellStyle = (cell, options = {}) => {
  const { 
    bold = false, 
    size = 11, 
    center = false, 
    yellow = false,
    border = true,
    italic = false,
    color = null
  } = options;

  cell.font = {
    name: 'Times New Roman',
    size,
    bold,
    italic,
    color: color ? { argb: color } : undefined
  };

  if (border) {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  cell.alignment = {
    vertical: 'middle',
    horizontal: center ? 'center' : 'left',
    wrapText: true
  };

  if (yellow) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }
    };
  }
};

export const exportDetailedCalculation = async ({
  devices,
  oldPeriodDays,
  newPeriodDays,
  totalDailyUsage,
  paidElectricity,
  customerInfo
}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Biên bản tính', {
      pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
        fitToPage: true,
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
      { width: 5 },   // TT
      { width: 25 },  // Tên thiết bị
      { width: 10 },  // Đơn vị tính
      { width: 8 },   // Số lượng
      { width: 8 },   // Công suất
      { width: 8 },   // Cosφ
      { width: 10 },  // Số giờ SDD
      { width: 12 },  // Điện năng bình quân
      { width: 12 },  // Số ngày vi phạm
      { width: 15 },  // Điện năng sử dụng
      { width: 15 },  // Điện năng đã phát hành
      { width: 12 },  // Điện năng bồi thường
      { width: 10 },  // Giá bán
      { width: 15 }   // Thành tiền
    ];

    // Add header section
    worksheet.mergeCells('A1:C1');
    const companyCell = worksheet.getCell('A1');
    companyCell.value = 'CÔNG TY ĐIỆN LỰC THANH HÓA';
    applyCellStyle(companyCell, { bold: true });

    worksheet.mergeCells('D1:N1');
    const countryCell = worksheet.getCell('D1');
    countryCell.value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
    applyCellStyle(countryCell, { bold: true, center: true });

    worksheet.mergeCells('A2:C2');
    const deptCell = worksheet.getCell('A2');
    deptCell.value = 'ĐIỆN LỰC A';
    applyCellStyle(deptCell, { bold: true });

    worksheet.mergeCells('D2:N2');
    const mottoCell = worksheet.getCell('D2');
    mottoCell.value = 'Độc lập - Tự do - Hạnh phúc';
    applyCellStyle(mottoCell, { bold: true, center: true, italic: true });

    // Add title
    worksheet.mergeCells('A4:N4');
    const titleCell = worksheet.getCell('A4');
    titleCell.value = 'BIÊN BẢN TÍNH';
    applyCellStyle(titleCell, { bold: true, center: true, size: 13 });

    worksheet.mergeCells('A5:N5');
    const subtitleCell = worksheet.getCell('A5');
    subtitleCell.value = 'ĐIỆN NĂNG, TIỀN ĐIỆN BỒI THƯỜNG DO VI PHẠM SỬ DỤNG ĐIỆN';
    applyCellStyle(subtitleCell, { bold: true, center: true, size: 13 });

    // Add legal basis section
    const legalBasis = [
      '- Căn cứ Luật Điện lực số: 28/2004/QH11, ngày 03/12/2004, Luật sửa đổi bổ sung một số điều của Luật Điện lực ngày 20 tháng 11 năm 2012',
      '- Căn cứ Điều 21 Chương IV và Phụ lục số II -Thông tư 42/2022/TT-BCT ngày 30/12/2022 Quy định về kiểm tra hoạt động điện lực và sử dụng điện, giải quyết',
      '- Căn cứ Hợp đồng mua bán điện số: ............ Ký ngày ...../.../..... Giữa Giám đốc Điện lực A và Ông Nguyễn Văn B',
      '- Căn cứ biên bản kiểm tra số: ....../BB-KTSDD ngày 12/8/2024, xác định hộ ông Nguyễn Văn B vi phạm khoản 6 điều 7 Luật Điện lực (trộm cắp điện)',
      '- Căn cứ Biên bản thỏa thuận thời gian bồi thường do vi phạm sử dụng điện'
    ];

    let currentRow = 7;
    legalBasis.forEach(text => {
      worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
      const cell = worksheet.getCell(`A${currentRow}`);
      cell.value = text;
      applyCellStyle(cell, { border: false });
      currentRow++;
    });

    // Add meeting date
    worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
    const meetingDate = worksheet.getCell(`A${currentRow}`);
    meetingDate.value = 'Hôm nay, ngày ..... tháng ..... năm 2024, tại Điện lực A chúng tôi gồm:';
    applyCellStyle(meetingDate, { center: true, border: false });
    currentRow += 2;

    // Add representatives section
    const representatives = [
      { text: 'I-ĐẠI DIỆN BÊN BÁN ĐIỆN-ĐIỆN LỰC A', bold: true },
      { text: 'Ông : Nguyễn Văn A                                                                  Chức vụ : Giám đốc' },
      { text: 'Ông : Nguyễn Văn                                                                    Chức vụ : Kiểm tra viên điện lực' },
      { text: '' },
      { text: 'II-ĐẠI DIỆN BÊN MUA ĐIỆN', bold: true },
      { text: 'Ông: Nguyễn Văn B                                                                   Chức vụ : Chủ hợp đồng mua bán điện' },
      { text: 'Số CCCD: 038........                                                                Ngày cấp                Nơi cấp' },
      { text: 'Mã khách hàng: PA07......' },
      { text: 'Địa chỉ mua điện:..........' }
    ];

    representatives.forEach(({ text, bold }) => {
      worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
      const cell = worksheet.getCell(`A${currentRow}`);
      cell.value = text;
      applyCellStyle(cell, { bold, border: false });
      currentRow++;
    });

    // Add agreement section
    currentRow += 2;
    worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
    const agreementTitle = worksheet.getCell(`A${currentRow}`);
    agreementTitle.value = 'Hai bên thống nhất thỏa thuận điện năng, tiền điện bồi thường do vi phạm sử dụng điện như sau:';
    applyCellStyle(agreementTitle, { border: false });
    currentRow++;

    const agreementDetails = [
      '- Thời gian tính bồi thường được xác định từ ngày : 22/12/2023 ÷ 20/12/2024',
      '- Tiền điện bồi thường được tính theo giá mua điện giờ bình thường - Giá bán điện cho các ngành sản xuất',
      '- Số ngày mất điện : 3,5 ngày; số ngày bồi thường (đã trừ đi số ngày mất điện) : 361,5 ngày được xác định tại Biên bản thỏa thuận thời gian bồi thường do vi phạm sử',
      '- Từ tháng ............ ghi chữ ngày.............; Từ tháng .................. ghi chữ ngày cuối tháng'
    ];

    agreementDetails.forEach(text => {
      worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
      const cell = worksheet.getCell(`A${currentRow}`);
      cell.value = text;
      applyCellStyle(cell, { border: false });
      currentRow++;
    });

    // Add calculation table title
    currentRow += 1;
    worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
    const calcTitle = worksheet.getCell(`A${currentRow}`);
    calcTitle.value = 'III. Bảng tính toán xác định điện năng, tiền điện bồi thường';
    applyCellStyle(calcTitle, { bold: true, border: false });
    currentRow++;

    // Add "1 giá" text
    worksheet.mergeCells(`K${currentRow}:L${currentRow}`);
    const hourCell = worksheet.getCell(`K${currentRow}`);
    hourCell.value = '1 giá';
    applyCellStyle(hourCell, { center: true, yellow: true });
    currentRow++;

    // Add table headers
    const tableStartRow = currentRow;
    const headers = [
      [
        { value: 'TT', rowspan: 3},
        { value: 'Tên thiết bị', rowspan: 3},
        { value: 'Đơn vị tính', rowspan: 3},
        { value: 'Số lượng', rowspan: 3},
        { value: 'Công suất', rowspan: 3},
        { value: 'Cosφ phải nhập', rowspan: 3, yellow: true },
        { value: 'Số giờ SDD trong ngày phải nhập', rowspan: 3, yellow: true },
        { value: 'Điện năng bình quân ngày (kWh)', rowspan: 3},
        { value: 'Số ngày vi phạm (Ngày)', rowspan: 3},
        { value: 'Điện năng sử dụng trong thời gian vi phạm (kWh)', rowspan: 3},
        { value: 'Điện năng đã phát hành hóa đơn trong thời gian vi phạm (kWh)', rowspan: 3},
        { value: 'Điện năng bồi thường (kWh)', rowspan: 3},
        { value: 'Giá bán điện', rowspan: 3},
        { value: 'Thành tiền (VNĐ)', rowspan: 3}
      ]
    ];

    headers.forEach((row, rowIndex) => {
      row.forEach((header, colIndex) => {
        if (header.rowspan) {
          worksheet.mergeCells(
            tableStartRow + rowIndex,
            colIndex + 1,
            tableStartRow + rowIndex + header.rowspan - 1,
            colIndex + 1
          );
        }
        const cell = worksheet.getCell(tableStartRow + rowIndex, colIndex + 1);
        cell.value = header.value;
        applyHeaderStyle(cell, { yellow: header.yellow });
      });
    });

    currentRow = tableStartRow + 3;

    // Add formula row
    const formulaRow = worksheet.getRow(currentRow);
    ['1', '2', '3', '4', '5', '6', '7', '8=4x5x6x7', '9', '10=8x9', '11', '12=10-11', '13', '14=12x13'].forEach((formula, index) => {
      const cell = formulaRow.getCell(index + 1);
      cell.value = formula;
      applyCellStyle(cell, { center: true, italic: true });
    });
    currentRow++;

    // Add device rows
    devices.forEach((device, index) => {
      const row = worksheet.getRow(currentRow);
      const dailyUsage = device.quantity * device.power * device.cosPhi * device.hoursPerDay;
      
      const values = [
        index + 1,
        device.name,
        device.unit,
        device.quantity,
        device.power?.toFixed(3),
        device.cosPhi,
        device.hoursPerDay,
        dailyUsage?.toFixed(1),
        '',
        '',
        '',
        '',
        '',
        ''
      ];

      values.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        applyCellStyle(cell, { 
          center: colIndex !== 1,
          yellow: colIndex === 5 || colIndex === 6
        });
      });

      currentRow++;
    });

    // Add summary rows
    const oldPeriodUsage = totalDailyUsage * oldPeriodDays;
    const oldPeriodCompensation = oldPeriodUsage - paidElectricity.old;
    const oldPeriodTotal = oldPeriodCompensation * 2870;

    const newPeriodUsage = totalDailyUsage * newPeriodDays;
    const newPeriodCompensation = newPeriodUsage - paidElectricity.new;
    const newPeriodTotal = newPeriodCompensation * 3007;

    // Add total daily usage row
    const dailyRow = worksheet.getRow(currentRow);
    dailyRow.getCell(1).value = 'Cộng: Điện năng trung bình ngày';
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    dailyRow.getCell(8).value = totalDailyUsage?.toFixed(1);
    applyCellStyle(dailyRow.getCell(1), { bold: true });
    applyCellStyle(dailyRow.getCell(8), { center: true });
    currentRow++;

    // Add old price period
    const oldRow = worksheet.getRow(currentRow);
    oldRow.getCell(1).value = '1. Số ngày SDD theo giá cũ (Từ ngày 22/12/2023 ÷ 10/10/2024)';
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    oldRow.getCell(8).value = totalDailyUsage?.toFixed(1);
    oldRow.getCell(9).value = oldPeriodDays;
    oldRow.getCell(10).value = oldPeriodUsage?.toFixed(3);
    oldRow.getCell(11).value = paidElectricity.old;
    oldRow.getCell(12).value = oldPeriodCompensation?.toFixed(3);
    oldRow.getCell(13).value = 2870;
    oldRow.getCell(14).value = oldPeriodTotal;
    oldRow.eachCell(cell => applyCellStyle(cell, { center: true }));
    currentRow++;

    // Add new price period
    const newRow = worksheet.getRow(currentRow);
    newRow.getCell(1).value = '2. Số ngày SDD theo giá bán điện mới (Từ ngày 11/10/2024 ÷ 10/10/2024)';
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    newRow.getCell(8).value = totalDailyUsage?.toFixed(1);
    newRow.getCell(9).value = newPeriodDays;
    newRow.getCell(10).value = newPeriodUsage?.toFixed(3);
    newRow.getCell(11).value = paidElectricity.new;
    newRow.getCell(12).value = newPeriodCompensation?.toFixed(3);
    newRow.getCell(13).value = 3007;
    newRow.getCell(14).value = newPeriodTotal;
    newRow.eachCell(cell => applyCellStyle(cell, { center: true }));
    currentRow++;

    // Add subtotal
    const subtotal = oldPeriodTotal + newPeriodTotal;
    const subtotalRow = worksheet.getRow(currentRow);
    subtotalRow.getCell(1).value = 'Cộng';
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    subtotalRow.getCell(14).value = subtotal;
    subtotalRow.eachCell(cell => applyCellStyle(cell, { center: true }));
    currentRow++;

    // Add VAT
    const vat = subtotal * 0.08;
    const vatRow = worksheet.getRow(currentRow);
    vatRow.getCell(1).value = 'Thuế VAT 8%';
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    vatRow.getCell(14).value = vat;
    vatRow.eachCell(cell => applyCellStyle(cell, { center: true }));
    currentRow++;

    // Add total
    const total = subtotal + vat;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'Tổng cộng';
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    totalRow.getCell(10).value = oldPeriodUsage + newPeriodUsage;
    totalRow.getCell(11).value = paidElectricity.old + paidElectricity.new;
    totalRow.getCell(12).value = oldPeriodCompensation + newPeriodCompensation;
    totalRow.getCell(14).value = total;
    totalRow.eachCell(cell => applyCellStyle(cell, { center: true }));
    currentRow += 2;

    // Add final summary
    const summaryRow = worksheet.getRow(currentRow);
    summaryRow.getCell(1).value = `Điện năng bồi thường (Lấy tròn số)      ${Math.round(oldPeriodCompensation + newPeriodCompensation)} kWh          Tiền điện bồi thường (Lấy tròn số)          ${Math.round(total)} đồng`;
    worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
    applyCellStyle(summaryRow.getCell(1), { border: false });
    currentRow++;

    // Add amount in words
    const wordsRow = worksheet.getRow(currentRow);
    wordsRow.getCell(1).value = 'Số tiền bằng chữ: (..... triệu.......................................................... đồng)';
    worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
    applyCellStyle(wordsRow.getCell(1), { border: false });
    currentRow++;

    // Add note
    const noteRow = worksheet.getRow(currentRow);
    noteRow.getCell(1).value = 'Biên bản này là 1 phần không thể tách rời của Biên bản thỏa thuận bồi thường điện năng, tiền điện do vi phạm sử dụng điện';
    worksheet.mergeCells(`A${currentRow}:N${currentRow}`);
    applyCellStyle(noteRow.getCell(1), { border: false, italic: true, color: 'FF0000', center: true });
    currentRow++;

    // Add date
    const dateRow = worksheet.getRow(currentRow);
    dateRow.getCell(8).value = 'Ngày .... tháng 12 năm 2024';
    worksheet.mergeCells(`H${currentRow}:N${currentRow}`);
    applyCellStyle(dateRow.getCell(8), { border: false, center: true });
    currentRow++;

    // Add signatures
    const signatureRow = worksheet.getRow(currentRow);
    signatureRow.getCell(1).value = 'ĐẠI DIỆN';
    signatureRow.getCell(8).value = 'ĐẠI DIỆN';
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    worksheet.mergeCells(`H${currentRow}:N${currentRow}`);
    applyCellStyle(signatureRow.getCell(1), { border: false, center: true });
    applyCellStyle(signatureRow.getCell(8), { border: false, center: true });
    currentRow++;

    const signatureRow2 = worksheet.getRow(currentRow);
    signatureRow2.getCell(1).value = 'BÊN MUA ĐIỆN';
    signatureRow2.getCell(8).value = 'ĐIỆN LỰC .......';
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    worksheet.mergeCells(`H${currentRow}:N${currentRow}`);
    applyCellStyle(signatureRow2.getCell(1), { border: false, center: true });
    applyCellStyle(signatureRow2.getCell(8), { border: false, center: true });

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
