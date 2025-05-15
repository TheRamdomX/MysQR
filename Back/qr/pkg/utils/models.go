package utils

type QRData struct {
	Timestamp int64  `json:"timestamp"`
	TeacherID string `json:"teacherId"`
	ClassID   string `json:"classId"`
	UUID      string `json:"uuid"`
}
