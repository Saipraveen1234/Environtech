# EmailJS Setup Guide for Solar Quote Form

## Overview
Your solar quote form is now integrated with EmailJS to send form submissions directly to your email without any backend infrastructure.

## Quick Setup Steps

### 1. Create EmailJS Account
- Visit [EmailJS.com](https://www.emailjs.com/)
- Sign up for a free account (200 emails/month free)
- Verify your email address

### 2. Add Email Service
- Go to **Email Services** in your EmailJS dashboard
- Click **"Add New Service"**
- Choose your email provider:
  - **Gmail** (recommended)
  - **Outlook**
  - **Yahoo**
  - **Other SMTP services**
- Follow the connection instructions
- **Save the Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
- Go to **Email Templates**
- Click **"Create New Template"**
- Set the template name: `Solar Quote Request`
- Use this template structure:

#### Subject Line:
```
New Solar Quote Request - {{customer_name}}
```

#### Template Content:
```
🌞 NEW SOLAR QUOTE REQUEST

==========================================
CUSTOMER INFORMATION
==========================================
Name: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}
City: {{customer_city}}
Property Address: {{customer_address}}
Roof Type: {{roof_type}}
Property Type: {{property_type}}
Current Monthly Bill: ₹{{monthly_bill}}
Installation Timeline: {{installation_timeline}}

Additional Notes:
{{customer_notes}}

==========================================
SOLAR SYSTEM DETAILS
==========================================
System Size: {{system_size}}
Annual Energy Generated: {{annual_energy}}
Estimated Annual Savings: {{annual_savings}}
Total System Cost: {{total_cost}}
Government Subsidy: {{government_subsidy}}

==========================================
SUBMISSION DETAILS
==========================================
Submission Date: {{submission_date}}
Form Type: {{form_type}}

==========================================
ACTION REQUIRED
==========================================
Please contact this customer within 24 hours to discuss their solar requirements and schedule a site assessment.

Best regards,
Solar Quote System
```

- Save the template and **note the Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key
- Go to **Account** → **General**
- Copy your **Public Key** (e.g., `user_abc123def456`)

### 5. Update Configuration
Open `js/main.js` and find the `EMAIL_CONFIG` object around line 570:

```javascript
const EMAIL_CONFIG = {
    serviceID: 'YOUR_SERVICE_ID',      // Replace with your Service ID
    templateID: 'YOUR_TEMPLATE_ID',    // Replace with your Template ID  
    publicKey: 'YOUR_PUBLIC_KEY'       // Replace with your Public Key
};
```

Replace with your actual values:
```javascript
const EMAIL_CONFIG = {
    serviceID: 'service_abc123',       // Your actual Service ID
    templateID: 'template_xyz789',     // Your actual Template ID
    publicKey: 'user_abc123def456'     // Your actual Public Key
};
```

### 6. Test the Setup
1. Open your website
2. Use the solar calculator
3. Click "Get Free Quote"
4. Fill out the form with test data
5. Submit the form
6. Check your email for the quote request

## Email Configuration Examples

### Gmail Setup
1. In EmailJS, select "Gmail" service
2. Click "Connect Account"
3. Allow EmailJS to access your Gmail
4. Your Gmail will be used to send emails

### Custom SMTP Setup
1. Select "Other" service
2. Enter your SMTP settings:
   - **SMTP Server**: smtp.your-provider.com
   - **Port**: 587 (or 465 for SSL)
   - **Username**: your-email@domain.com
   - **Password**: your-email-password

## Optional Enhancements

### Auto-Reply to Customers
Create a second template for customer confirmation:

**Template Name**: `Quote Confirmation`
**Subject**: `Thank you for your solar quote request`
**Content**:
```
Dear {{customer_name}},

Thank you for your interest in our solar solutions!

We have received your quote request for a {{system_size}} solar system that could save you {{annual_savings}} annually.

Our solar experts will contact you within 24 hours at {{customer_phone}} to discuss your requirements and schedule a free site assessment.

System Details:
- Size: {{system_size}}
- Annual Energy: {{annual_energy}}
- Estimated Savings: {{annual_savings}}

If you have any immediate questions, please don't hesitate to contact us.

Best regards,
Solar Team
```

### Email Delivery Settings
- **From Name**: Your Company Name
- **From Email**: noreply@yourdomain.com
- **Reply To**: your-business-email@domain.com

## Troubleshooting

### Form Not Sending Emails
1. Check browser console for errors
2. Verify all three configuration values are correct
3. Ensure your EmailJS service is active
4. Check EmailJS quota (free tier: 200 emails/month)

### Gmail Issues
1. Enable "Less secure app access" in Gmail settings
2. Or use App Passwords for better security
3. Ensure your Gmail account is verified

### Template Issues
1. Verify template variable names match exactly
2. Check for typos in template ID
3. Ensure template is saved and published

## Support
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
- Test your setup with EmailJS's built-in test feature

## Security Notes
- Your EmailJS public key is safe to use in frontend code
- Never expose your private key or email passwords
- Consider upgrading to paid EmailJS plan for higher limits
- Monitor your email quota regularly

---

Once configured, your solar quote form will automatically send detailed quote requests to your email address whenever customers submit the form! 