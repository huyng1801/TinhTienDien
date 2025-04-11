import ExcelJS from 'exceljs';
import { message } from 'antd';
import dayjs from 'dayjs';

const formatCurrency = (value) => {
  if (!value) return 0;
  return Math.round(value);
};

const createHeaderRows = () => {
  return [
    ['CÔNG TY ĐIỆN LỰC THANH HÓA', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    ['ĐIỆN LỰC A', '', '', 'Độc lập - Tự do - Hạnh phúc'],
    ['', '', '', ''],
    ['', 'BIÊN BẢN TÍNH', '', ''],
    ['', 'ĐIỆN NĂNG, TIỀN ĐIỆN BỒI THƯỜNG DO VI PHẠM SỬ DỤNG ĐIỆN', '', ''],
    [''],
    ['- Căn cứ Luật Điện lực số: 28/2004/QH11, ngày 03/12/2004, Luật sửa đổi bổ sung một số điều của Luật Điện lực ngày 20 tháng 11 năm 2012'],
    ['- Căn cứ Điều 21 Chương IV và Phụ lục số II -Thông tư 42/2022/TT-BCT ngày 30/12/2022 Quy định về kiểm tra hoạt động điện lực và sử dụng điện, giải quyết tranh chấp HĐMBĐ'],
    ['- Căn cứ Hợp đồng mua bán điện số: ............ Ký ngày ...../.../..... Giữa Giám đốc Điện lực A và Ông Nguyễn Văn B'],
    ['- Căn cứ biên bản kiểm tra số: ....../BB -KTSĐD ngày 04/03/2025 xác định hộ ông Nguyễn Văn B vi phạm khoản 6 điều 7 Luật Điện lực (trộm cắp điện)'],
    ['- Căn cứ Biên bản thỏa thuận thời gian bồi thường do vi phạm sử dụng điện'],
    [''],
    ['Hôm nay, ngày ..... tháng 03 năm 2025, tại Điện lực A chúng tôi gồm'],
    [''],
    ['I-ĐẠI DIỆN BÊN BÁN ĐIỆN-ĐIỆN LỰC A'],
    ['Ông :', 'Nguyễn Văn A', '', 'Chức vụ :', 'Giám đốc'],
    ['Ông :', 'Nguyễn Văn', '', 'Chức vụ :', 'Kiểm tra viên điện lực'],
    [''],
    ['II-ĐẠI DIỆN BÊN MUA ĐIỆN'],
    ['Ông:', 'Nguyễn Văn B', '', 'Chức vụ :', 'Chủ hợp đồng mua bán điện'],
    ['Số CCCD: :', '038........', '', 'Ngày cấp', 'Nơi cấp'],
    ['Mã khách hàng: PA07......'],
    ['Địa chỉ mua điện:..........'],
    [''],
    ['Hai bên thống nhất thỏa thuận điện năng, tiền điện bồi thường do vi phạm sử dụng điện như sau:'],
    ['- Thời gian tính bồi thường được xác định từ ngày : 5/3/2024÷ 4/3/2025'],
    ['- Số ngày mất điện : 3,5 ngày; số ngày bồi thường (đã trừ đi số ngày mất điện) : 361,5 ngày được xác định tại Biên bản thỏa thuận thời gian bồi thường do vi phạm sử'],
    ['- Từ tháng 3/2024÷3/2025 ghi chữ ngày cuối tháng'],
    [''],
    ['III. Bảng tính toán xác định điện năng, tiền điện bồi thường']
  ];
};

export const exportToExcel = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Set column widths
    worksheet.columns = [
      { width: 8 },   // STT
      { width: 25 },  // Tên thiết bị
      { width: 10 },  // Số lượng
      { width: 15 },  // Công suất
      { width: 12 },  // Hệ số Cosφ
      { width: 15 },  // Số giờ sử dụng
      { width: 15 },  // Số ngày sử dụng
      { width: 15 },  // Điện năng sử dụng
      { width: 15 },  // Biểu giá
      { width: 15 },  // ĐN đã phát hành
      { width: 15 },  // Điện năng bồi thường
      { width: 15 },  // Giá bán điện
      { width: 15 }   // Thành tiền
    ];

    // Add headers
    const headers = [
      'STT',
      'Tên thiết bị',
      'Số lượng',
      'Công suất (kW)',
      'Hệ số Cosφ',
      'Số giờ sử dụng trong ngày',
      'Số ngày sử dụng trong kỳ',
      'Điện năng sử dụng trong kỳ',
      'Biểu giá bán điện',
      'ĐN đã phát hành HĐ',
      'Điện năng bồi thường',
      'Giá bán điện',
      'Thành tiền'
    ];

    // Add header row
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    if (data && data.periods) {
      data.periods.forEach((period, periodIndex) => {
        // Add period header
        const periodHeader = worksheet.addRow([
          `Tháng ${period.period.month}/${period.period.year}${
            period.period.month === 10 && period.period.year === 2024
              ? ` (${dayjs(period.period.startDate).format('DD/MM')} - ${dayjs(period.period.endDate).format('DD/MM')})`
              : ''
          }`
        ]);
        periodHeader.font = { bold: true };

        // Add devices
        period.devices.forEach((device, index) => {
          const row = worksheet.addRow([
            index + 1,
            device.name,
            Math.round(device.quantity), // Round to integer
            device.power,
            device.cosPhi,
            device.hoursPerDay,
            device.daysPerPeriod,
            device.powerUsage?.toFixed(2) || 0,
            '',
            '',
            '',
            '',
            ''
          ]);

          // Format numbers
          row.getCell(3).numFmt = '0'; // Integer format for quantity
          row.getCell(4).numFmt = '0.000'; // 3 decimal places for power
          row.getCell(8).numFmt = '0.00'; // 2 decimal places for power usage
        });

        // Add period summary
        const summaryRow = worksheet.addRow([
          'Cộng',
          '',
          '',
          '',
          '',
          '',
          period.period.violationDays - period.period.outageDays,
          period.totalPowerUsage?.toFixed(2) || 0
        ]);
        summaryRow.font = { bold: true };
      });

      // Add grand total
      const totalPowerUsage = data.periods.reduce((sum, period) => sum + period.totalPowerUsage, 0);
      const grandTotalRow = worksheet.addRow([
        'Tổng cộng',
        '',
        '',
        '',
        '',
        '',
        data.totalDays,
        totalPowerUsage.toFixed(2)
      ]);
      grandTotalRow.font = { bold: true };
    }

    // Apply borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bảng tính điện năng bồi thường ${dayjs().format('DD-MM-YYYY')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    message.success('Xuất Excel thành công');
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    message.error('Có lỗi xảy ra khi xuất Excel');
  }
};