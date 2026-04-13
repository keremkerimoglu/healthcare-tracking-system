import React, { useState } from 'react';
import { feedbackService } from '../services/api';
import '../styles/FeedbackModal.css';

const FeedbackModal = ({ appointmentId, patientId, doctorId, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Lütfen bir yorum yazınız.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Lütfen 1-5 arasında bir puan seçiniz.');
      return;
    }

    try {
      setLoading(true);
      const feedbackData = {
        appointmentId: appointmentId,
        patientId: patientId,
        doctorId: doctorId,
        rating: parseInt(rating),
        comment: comment
      };

      const response = await feedbackService.submitFeedback(feedbackData);
      if (response.data.success) {
        setComment('');
        setRating(5);
        onSubmitSuccess();
      }
    } catch (err) {
      setError('Geri bildirim gönderilirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⭐ Doktorunuzu Değerlendirin</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Rating Selection */}
          <div className="form-group">
            <label>Puan (1-5 yıldız):</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  title={`${star} yıldız`}
                >
                  ⭐
                </button>
              ))}
              <span className="rating-text">{rating}/5</span>
            </div>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label htmlFor="comment">Yorum:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Doktor hakkındaki deneyiminizi paylaşın... Örn: Doktor çok dikkatli ve hastalarını iyi dinliyor."
              rows="5"
            />
            <div className="char-count">
              {comment.length} / 500 karakter
            </div>
          </div>

          {/* Info */}
          <div className="info-box">
            <p>💡 <strong>Bilgi:</strong> Yorumlarınız admin tarafından onaylanacak ve ardından diğer hastalar için yayınlanacaktır.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            İptal
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
