import './SuccessModal.css'

const SuccessModal = ({ show, message, onClose }) => {
  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">✓</div>
        <h2>Success!</h2>
        <p>{message}</p>
        <button onClick={onClose} className="btn btn-primary">
          OK
        </button>
      </div>
    </div>
  )
}

export default SuccessModal

