/**
 * Validation Service
 * Provides consistent validation rules across the application
 */

class ValidationService {
  constructor() {
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    this.phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    if (!email) {
      return { isValid: false, message: "Email is required" };
    }
    
    if (!this.emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    if (!password) {
      return { isValid: false, message: "Password is required" };
    }
    
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    
    if (!this.passwordRegex.test(password)) {
      return { 
        isValid: false, 
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
      };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate password confirmation
   */
  validatePasswordConfirmation(password, confirmation) {
    if (!confirmation) {
      return { isValid: false, message: "Please confirm your password" };
    }
    
    if (password !== confirmation) {
      return { isValid: false, message: "Passwords do not match" };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate phone number (Malaysian format)
   */
  validatePhone(phone) {
    if (!phone) {
      return { isValid: false, message: "Phone number is required" };
    }
    
    if (!this.phoneRegex.test(phone)) {
      return { isValid: false, message: "Please enter a valid Malaysian phone number" };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate required fields
   */
  validateRequired(value, fieldName) {
    if (!value || value.trim() === "") {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate minimum length
   */
  validateMinLength(value, minLength, fieldName) {
    if (!value || value.length < minLength) {
      return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate maximum length
   */
  validateMaxLength(value, maxLength, fieldName) {
    if (value && value.length > maxLength) {
      return { isValid: false, message: `${fieldName} must be no more than ${maxLength} characters long` };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate numeric value
   */
  validateNumeric(value, fieldName) {
    if (value && isNaN(value)) {
      return { isValid: false, message: `${fieldName} must be a number` };
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Validate URL format
   */
  validateUrl(url) {
    if (!url) {
      return { isValid: false, message: "URL is required" };
    }
    
    try {
      new URL(url);
      return { isValid: true, message: "" };
    } catch {
      return { isValid: false, message: "Please enter a valid URL" };
    }
  }

  /**
   * Validate form data object
   */
  validateForm(formData, validationRules) {
    const errors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(validationRules)) {
      const value = formData[field];
      
      for (const rule of rules) {
        let validation;
        
        switch (rule.type) {
          case 'required':
            validation = this.validateRequired(value, rule.fieldName || field);
            break;
          case 'email':
            validation = this.validateEmail(value);
            break;
          case 'password':
            validation = this.validatePassword(value);
            break;
          case 'passwordConfirmation':
            validation = this.validatePasswordConfirmation(formData.password, value);
            break;
          case 'phone':
            validation = this.validatePhone(value);
            break;
          case 'minLength':
            validation = this.validateMinLength(value, rule.value, rule.fieldName || field);
            break;
          case 'maxLength':
            validation = this.validateMaxLength(value, rule.value, rule.fieldName || field);
            break;
          case 'numeric':
            validation = this.validateNumeric(value, rule.fieldName || field);
            break;
          case 'url':
            validation = this.validateUrl(value);
            break;
          case 'custom':
            validation = rule.validator(value, formData);
            break;
        }
        
        if (!validation.isValid) {
          errors[field] = validation.message;
          isValid = false;
          break; // Stop checking other rules for this field
        }
      }
    }

    return { isValid, errors };
  }

  /**
   * Show validation errors in form
   */
  showFormErrors(form, errors) {
    // Clear previous error messages
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    // Show new error messages
    for (const [field, message] of Object.entries(errors)) {
      const fieldElement = form.querySelector(`[name="${field}"]`);
      if (fieldElement) {
        fieldElement.classList.add('is-invalid');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message text-danger mt-1';
        errorElement.textContent = message;
        
        fieldElement.parentNode.appendChild(errorElement);
      }
    }
  }

  /**
   * Clear validation errors from form
   */
  clearFormErrors(form) {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  /**
   * Validate single field with real-time feedback
   */
  validateField(field, value, rules) {
    for (const rule of rules) {
      let validation;
      
      switch (rule.type) {
        case 'required':
          validation = this.validateRequired(value, rule.fieldName || field);
          break;
        case 'email':
          validation = this.validateEmail(value);
          break;
        case 'password':
          validation = this.validatePassword(value);
          break;
        case 'phone':
          validation = this.validatePhone(value);
          break;
        case 'minLength':
          validation = this.validateMinLength(value, rule.value, rule.fieldName || field);
          break;
        case 'maxLength':
          validation = this.validateMaxLength(value, rule.value, rule.fieldName || field);
          break;
        case 'numeric':
          validation = this.validateNumeric(value, rule.fieldName || field);
          break;
        case 'url':
          validation = this.validateUrl(value);
          break;
        case 'custom':
          validation = rule.validator(value);
          break;
      }
      
      if (!validation.isValid) {
        return validation;
      }
    }
    
    return { isValid: true, message: "" };
  }

  /**
   * Set up real-time validation for form fields
   */
  setupRealTimeValidation(form, validationRules) {
    for (const [field, rules] of Object.entries(validationRules)) {
      const fieldElement = form.querySelector(`[name="${field}"]`);
      if (fieldElement) {
        fieldElement.addEventListener('blur', () => {
          const value = fieldElement.value;
          const validation = this.validateField(field, value, rules);
          
          // Remove previous error
          const prevError = fieldElement.parentNode.querySelector('.error-message');
          if (prevError) prevError.remove();
          fieldElement.classList.remove('is-invalid', 'is-valid');
          
          if (!validation.isValid) {
            fieldElement.classList.add('is-invalid');
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message text-danger mt-1';
            errorElement.textContent = validation.message;
            fieldElement.parentNode.appendChild(errorElement);
          } else if (value) {
            fieldElement.classList.add('is-valid');
          }
        });
      }
    }
  }
}

// Create singleton instance
const validationService = new ValidationService();

export default validationService; 