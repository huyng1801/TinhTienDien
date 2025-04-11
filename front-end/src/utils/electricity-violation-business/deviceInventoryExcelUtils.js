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

const applyTitleStyle = (cell, isUnderlined = false) => {
  cell.font = {
    name: 'Times New Roman',
    size: 14,
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

const applyCellStyle = (cell, isNumber = false, isQuantity = false) => {
  cell.font = {
    name: 'Times New Roman',
    size: 11
  };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  cell.alignment = {
    vertical: 'middle',
    wrapText: true
  };
  if (isNumber) {
    cell.alignment.horizontal = 'center';
    if (isQuantity) {
      cell.numFmt = '0'; // Integer format for quantity
      cell.font.color = { argb: '0000FF' }; // Blue color for quantity
    } else {
      cell.numFmt = '0.000'; // 3 decimal places for power
    }
  }
};

const applySttStyle = (cell) => {
  cell.font = {
    name: 'Times New Roman',
    size: 11
  };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  };
  cell.numFmt = '0';
};

export const exportDeviceInventory = async (devices) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bảng kê CS-SH', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'portrait'
      }
    });

    // Set column widths
    worksheet.columns = [
      { width: 6 },  // STT
      { width: 35 }, // Tên thiết bị
      { width: 8 },  // ĐVT
      { width: 10 }, // Số lượng
      { width: 15 }, // Công suất
      { width: 20 }  // Ghi chú
    ];

    // Add title section
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
    applyTitleStyle(titleCell);

    worksheet.mergeCells('A2:F2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = 'Độc lập - Tự do - Hạnh phúc';
    applyTitleStyle(subtitleCell, true);

    worksheet.mergeCells('A4:F4');
    const mainTitleCell = worksheet.getCell('A4');
    mainTitleCell.value = 'BẢNG KÊ CÔNG SUẤT THIẾT BỊ VI PHẠM SỬ DỤNG ĐIỆN';
    applyTitleStyle(mainTitleCell);

    worksheet.mergeCells('A6:F6');
    const referenceCell = worksheet.getCell('A6');
    referenceCell.value = 'Căn cứ Biên bản kiểm tra sử dụng điện số: ....../ ....../BB-KTSDD, ngày ..../..../2025.';
    referenceCell.font = { name: 'Times New Roman', size: 11 };

    // Add sections
    const sections = [
      { row: 8, text: 'I. Đại diện bên bán điện: Điện lực .............' },
      { row: 9, text: '1. Ông: ................................ Chức vụ: .....................................................' },
      { row: 10, text: '2. Ông: ................................ Chức vụ: ......................................... Số thẻ KTV:...................' },
      { row: 11, text: '3. Ông: ................................ Chức vụ: ......................................... Số thẻ KTV:...................' },
      { row: 13, text: 'II. Đại diện bên vi phạm SDD:' },
      { row: 14, text: '1. Ông (bà): ............................ Chức vụ: ...........................................' },
      { row: 15, text: 'Mã khách hàng:...............................................................................' },
      { row: 16, text: 'Số: CCCD...................................................................................' },
      { row: 18, text: 'III. Người làm chứng (Nếu có):' },
      { row: 19, text: '1. Ông: ................................ Chức vụ: ...........................................' },
      { row: 20, text: '2. Ông: ................................ Chức vụ: ...........................................' },
      { row: 22, text: 'IV. Bảng kê thiết bị vi phạm SDD đối với phụ tải: Sinh hoạt; ........' }
    ];

    sections.forEach(({ row, text }) => {
      worksheet.mergeCells(`A${row}:F${row}`);
      const cell = worksheet.getCell(`A${row}`);
      cell.value = text;
      cell.font = {
        name: 'Times New Roman',
        size: 11,
        bold: row === 8 || row === 13 || row === 18 || row === 22
      };
    });

    // Add table headers
    const headerRow = 24;
    const headers = ['STT', 'Tên thiết bị', 'ĐVT', 'Số lượng', 'Công suất (kW)', 'Ghi chú'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(headerRow, index + 1);
      cell.value = header;
      applyHeaderStyle(cell);
    });

    // Filter out devices with empty names
    const validDevices = devices.filter(device => device.name && device.name.trim() !== '');

    // Add device rows
    let rowIndex = headerRow + 1;
    validDevices.forEach((device, index) => {
      const row = worksheet.getRow(rowIndex);
      row.height = 25;

      // STT
      const sttCell = row.getCell(1);
      sttCell.value = index + 1;
      applySttStyle(sttCell);

      // Tên thiết bị
      const nameCell = row.getCell(2);
      nameCell.value = device.name;
      applyCellStyle(nameCell);

      // ĐVT
      const unitCell = row.getCell(3);
      unitCell.value = device.unit || 'Cái';
      applyCellStyle(unitCell);

      // Số lượng
      const quantityCell = row.getCell(4);
      quantityCell.value = Math.round(device.quantity); // Round to integer
      applyCellStyle(quantityCell, true, true);

      // Công suất
      const powerCell = row.getCell(5);
      powerCell.value = device.power;
      applyCellStyle(powerCell, true);

      // Ghi chú
      const noteCell = row.getCell(6);
      noteCell.value = device.note || '';
      applyCellStyle(noteCell);

      rowIndex++;
    });

    // Add empty rows to reach 22 total rows
    while (rowIndex < headerRow + devices.length) {
      const row = worksheet.getRow(rowIndex);
      row.height = 25;

      // STT
      const sttCell = row.getCell(1);
      sttCell.value = rowIndex - headerRow + 1;
      applySttStyle(sttCell);

      // Empty cells
      for (let i = 2; i <= 6; i++) {
        const cell = row.getCell(i);
        cell.value = i === 3 ? 'Cái' : '';
        applyCellStyle(cell, i === 4 || i === 5, i === 4);
      }

      rowIndex++;
    }

    // Add footer
    const footerStartRow = rowIndex + 1;
    
    worksheet.mergeCells(`A${footerStartRow}:F${footerStartRow}`);
    const footerCell = worksheet.getCell(`A${footerStartRow}`);
    footerCell.value = 'Biên bản này là Phụ lục đính kèm Biên bản kiểm tra sử dụng điện số: ......../BB-KTSDD, ngày ..../...../ 2025';
    footerCell.font = { name: 'Times New Roman', size: 11 };

    worksheet.mergeCells(`D${footerStartRow + 2}:F${footerStartRow + 2}`);
    const dateCell = worksheet.getCell(`D${footerStartRow + 2}`);
    dateCell.value = '........... ngày ..... tháng 03 năm 2025';
    dateCell.font = { name: 'Times New Roman', size: 11 };
    dateCell.alignment = { horizontal: 'center' };

    // Add signature section
    const signatureRow = footerStartRow + 4;
    const signatures = [
      ['ĐẠI DIỆN', 'NGƯỜI', 'ĐẠI DIỆN'],
      ['BÊN MUA ĐIỆN', 'LÀM CHỨNG', 'BÊN BÁN ĐIỆN'],
      ['(Ký ghi rõ họ tên)', '(Ký ghi rõ họ tên)', '(Ký tên, đóng dấu)']
    ];

    signatures.forEach((row, rowIndex) => {
      row.forEach((text, colIndex) => {
        const cell = worksheet.getCell(signatureRow + rowIndex, colIndex * 2 + 1);
        worksheet.mergeCells(signatureRow + rowIndex, colIndex * 2 + 1, signatureRow + rowIndex, colIndex * 2 + 2);
        cell.value = text;
        cell.font = {
          name: 'Times New Roman',
          size: 11,
          bold: rowIndex < 2,
          italic: rowIndex === 2
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
    link.download = `Bảng kê CS-SH ${dayjs().format('DD-MM-YYYY')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    message.success('Xuất bảng kê CS-SH thành công');
  } catch (error) {
    console.error('Lỗi khi xuất bảng kê CS-SH:', error);
    message.error('Có lỗi xảy ra khi xuất bảng kê CS-SH');
  }
};