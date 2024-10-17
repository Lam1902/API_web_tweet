export const HTTP_STATUS = {
  // 2xx Success
  OK: 200, // Yêu cầu thành công
  CREATED: 201, // Yêu cầu đã được thực hiện và tài nguyên mới đã được tạo
  ACCEPTED: 202, // Yêu cầu đã được chấp nhận để xử lý, nhưng chưa hoàn thành
  NO_CONTENT: 204, // Yêu cầu đã được thực hiện thành công, nhưng không có nội dung nào được trả về

  // 4xx Client Errors
  BAD_REQUEST: 400, // Yêu cầu không hợp lệ
  UNAUTHORIZED: 401, // Yêu cầu yêu cầu xác thực người dùng
  FORBIDDEN: 403, // Máy chủ hiểu yêu cầu nhưng từ chối thực hiện nó
  NOT_FOUND: 404, // Tài nguyên được yêu cầu không tồn tại
  METHOD_NOT_ALLOWED: 405, // Phương thức yêu cầu không được phép
  CONFLICT: 409, // Xung đột với trạng thái hiện tại của tài nguyên
  UNPROCESSABLE_ENTITY: 422,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500, // Lỗi máy chủ nội bộ
  NOT_IMPLEMENTED: 501, // Máy chủ không hỗ trợ chức năng cần thiết để thực hiện yêu cầu
  BAD_GATEWAY: 502, // Máy chủ nhận được phản hồi không hợp lệ từ máy chủ ngược dòng
  SERVICE_UNAVAILABLE: 503, // Máy chủ không thể xử lý yêu cầu do quá tải hoặc bảo trì
  GATEWAY_TIMEOUT: 504 // Máy chủ ngược dòng không trả về phản hồi kịp thời
} as const
 