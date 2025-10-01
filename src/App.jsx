import { useState, useEffect, useRef } from 'react'
import './App.css'

// Accessible Modal Component
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      modalRef.current?.focus()
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleTabTrap = (e) => {
      if (e.key === 'Tab' && isOpen) {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements?.[0]
        const lastElement = focusableElements?.[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus()
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTabTrap)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTabTrap)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

// Accessible Form Component
function ContactForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    newsletter: false
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Focus first error field
      const firstErrorField = Object.keys(newErrors)[0]
      document.getElementById(firstErrorField)?.focus()
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onSubmit(formData)
      setFormData({ name: '', email: '', subject: '', message: '', newsletter: false })
    } catch (error) {
      setErrors({ submit: 'Failed to submit form. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Name <span className="required" aria-label="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={errors.name ? 'true' : 'false'}
          required
        />
        {errors.name && (
          <div id="name-error" className="error-message" role="alert" aria-live="polite">
            {errors.name}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email <span className="required" aria-label="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'error' : ''}`}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={errors.email ? 'true' : 'false'}
          required
        />
        {errors.email && (
          <div id="email-error" className="error-message" role="alert" aria-live="polite">
            {errors.email}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="subject" className="form-label">
          Subject <span className="required" aria-label="required">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`form-select ${errors.subject ? 'error' : ''}`}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          aria-invalid={errors.subject ? 'true' : 'false'}
          required
        >
          <option value="">Please select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="feedback">Feedback</option>
          <option value="accessibility">Accessibility Question</option>
        </select>
        {errors.subject && (
          <div id="subject-error" className="error-message" role="alert" aria-live="polite">
            {errors.subject}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="message" className="form-label">
          Message <span className="required" aria-label="required">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={`form-textarea ${errors.message ? 'error' : ''}`}
          aria-describedby={errors.message ? 'message-error' : 'message-hint'}
          aria-invalid={errors.message ? 'true' : 'false'}
          rows={5}
          required
        />
        <div id="message-hint" className="form-hint">
          Please provide details about your inquiry
        </div>
        {errors.message && (
          <div id="message-error" className="error-message" role="alert" aria-live="polite">
            {errors.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
            className="checkbox-input"
          />
          <span className="checkbox-text">Subscribe to our newsletter for updates</span>
        </label>
      </div>

      {errors.submit && (
        <div className="error-message" role="alert" aria-live="polite">
          {errors.submit}
        </div>
      )}

      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting}
        aria-describedby="submit-status"
      >
        {isSubmitting ? 'Submitting...' : 'Send Message'}
      </button>
      
      <div id="submit-status" className="sr-only" aria-live="polite">
        {isSubmitting ? 'Form is being submitted' : ''}
      </div>
    </form>
  )
}

// Main App Component
function App() {
  const [showModal, setShowModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [currentPage, setCurrentPage] = useState('home')
  
  // Skip link focus management
  useEffect(() => {
    const skipLink = document.querySelector('.skip-link')
    const mainContent = document.getElementById('main-content')
    
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault()
        mainContent.focus()
      })
    }
  }, [])

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Font size adjustment
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize])

  const handleFormSubmit = (data) => {
    console.log('Form submitted:', data)
    setShowModal(false)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const announcements = [
    "Welcome to our accessible web application",
    "This site is optimized for screen readers and keyboard navigation",
    "Use Tab to navigate and Enter to activate buttons"
  ]

  return (
    <div className="app">
      {/* Skip to main content */}
      <div className="sr-only" aria-live="polite" id="announcements">
        {showAlert && "Your message has been sent successfully!"}
      </div>

      <header className="site-header" role="banner">
        <div className="header-content">
          <h1 className="site-title">
            <span aria-hidden="true">♿</span>
            Accessible Web App
          </h1>
          
          <nav className="main-nav" role="navigation" aria-label="Main navigation">
            <ul className="nav-list">
              <li>
                <button 
                  className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('home')}
                  aria-current={currentPage === 'home' ? 'page' : undefined}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  className={`nav-button ${currentPage === 'about' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('about')}
                  aria-current={currentPage === 'about' ? 'page' : undefined}
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  className="nav-button"
                  onClick={() => setShowModal(true)}
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="accessibility-controls" role="toolbar" aria-label="Accessibility controls">
            <button 
              className="control-button"
              onClick={() => setDarkMode(!darkMode)}
              aria-pressed={darkMode}
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            <fieldset className="font-size-controls">
              <legend className="sr-only">Font size controls</legend>
              {['small', 'medium', 'large'].map((size) => (
                <label key={size} className="radio-label">
                  <input
                    type="radio"
                    name="font-size"
                    value={size}
                    checked={fontSize === size}
                    onChange={() => setFontSize(size)}
                    className="radio-input sr-only"
                  />
                  <span className={`radio-button ${fontSize === size ? 'selected' : ''}`}>
                    {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                  </span>
                  <span className="sr-only">{size} font size</span>
                </label>
              ))}
            </fieldset>
          </div>
        </div>
      </header>

      <main id="main-content" className="main-content" tabIndex={-1}>
        {showAlert && (
          <div className="alert alert-success" role="alert" aria-live="assertive">
            <strong>Success!</strong> Your message has been sent successfully.
            <button 
              className="alert-close" 
              onClick={() => setShowAlert(false)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        {currentPage === 'home' && (
          <section className="hero-section">
            <h2>Welcome to Our Accessible Web Application</h2>
            <p className="hero-text">
              This application demonstrates WCAG 2.1 AA compliance with features including:
            </p>
            
            <ul className="feature-list" role="list">
              <li role="listitem">✓ Semantic HTML structure</li>
              <li role="listitem">✓ Keyboard navigation support</li>
              <li role="listitem">✓ Screen reader optimization</li>
              <li role="listitem">✓ High contrast color schemes</li>
              <li role="listitem">✓ Focus management</li>
              <li role="listitem">✓ ARIA landmarks and labels</li>
              <li role="listitem">✓ Responsive design</li>
              <li role="listitem">✓ Skip navigation links</li>
            </ul>

            <div className="cta-section">
              <button 
                className="primary-button"
                onClick={() => setShowModal(true)}
              >
                Get Started
              </button>
              <button 
                className="secondary-button"
                onClick={() => setCurrentPage('about')}
              >
                Learn More
              </button>
            </div>
          </section>
        )}

        {currentPage === 'about' && (
          <section className="about-section">
            <h2>About Accessibility</h2>
            <div className="content-grid">
              <article className="info-card">
                <h3>WCAG Guidelines</h3>
                <p>
                  The Web Content Accessibility Guidelines (WCAG) provide a framework 
                  for making web content accessible to people with disabilities.
                </p>
                <a href="https://www.w3.org/WAI/WCAG21/quickref/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="card-link"
                >
                  View WCAG Guidelines
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </article>
              
              <article className="info-card">
                <h3>Keyboard Navigation</h3>
                <ul>
                  <li>Tab - Move to next interactive element</li>
                  <li>Shift + Tab - Move to previous element</li>
                  <li>Enter/Space - Activate buttons and links</li>
                  <li>Arrow keys - Navigate within components</li>
                  <li>Escape - Close modals and menus</li>
                </ul>
              </article>
              
              <article className="info-card">
                <h3>Screen Reader Support</h3>
                <p>
                  This application is optimized for screen readers with proper 
                  semantic markup, ARIA labels, and live regions for dynamic content.
                </p>
              </article>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="footer-content">
          <p>
            &copy; 2024 Accessible Web App. Built with accessibility in mind.
          </p>
          <nav className="footer-nav" aria-label="Footer navigation">
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#accessibility">Accessibility Statement</a></li>
            </ul>
          </nav>
        </div>
      </footer>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Contact Us"
      >
        <ContactForm onSubmit={handleFormSubmit} />
      </Modal>
    </div>
  )
}

export default App
