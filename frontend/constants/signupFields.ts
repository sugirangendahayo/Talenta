// =============================================
// MINIMAL SIGNUP FIELDS - Exactly as specified
// =============================================

export const jobSeekerSignupFields = [
  {
    key: "fullName",
    label: "Full Name",
    placeholder: "Enter your full name",
    icon: "person",
  },
  {
    key: "username",
    label: "Username",
    placeholder: "username",
    icon: "at",
    type: "username",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "Enter your email",
    icon: "email",
    keyboardType: "email-address",
  },
  {
    key: "password",
    label: "Password",
    placeholder: "Create a password",
    icon: "lock",
    secureTextEntry: true,
  },
];

export const employerSignupFields = [
  {
    key: "companyName",
    label: "Company Name",
    placeholder: "Enter your company name",
    icon: "business",
  },
  {
    key: "companyUsername",
    label: "Company Username",
    placeholder: "companyhandle",
    icon: "at",
    type: "username",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "Enter company email",
    icon: "email",
    keyboardType: "email-address",
  },
  {
    key: "password",
    label: "Password",
    placeholder: "Create a password",
    icon: "lock",
    secureTextEntry: true,
  },
  {
    key: "website",
    label: "Company Website (Optional)",
    placeholder: "Enter company website",
    icon: "language",
    keyboardType: "url",
  },
];

// =============================================
// KEEP THESE FOR LATER (Profile Completion)
// =============================================

export const jobSeekerProfileCompletionFields = [
  {
    key: "dateOfBirth",
    label: "Date of Birth",
    placeholder: "Select your date of birth",
    icon: "cake",
    type: "date",
  },
  {
    key: "gender",
    label: "Gender",
    placeholder: "Select your gender",
    icon: "person-outline",
    type: "dropdown",
  },
  {
    key: "country",
    label: "Country",
    placeholder: "Select your country",
    icon: "location-on",
    type: "dropdown",
  },
  {
    key: "city",
    label: "City",
    placeholder: "Enter your city",
    icon: "location-city",
  },
  {
    key: "phone",
    label: "Phone Number (Optional)",
    placeholder: "Enter your phone number",
    icon: "phone",
    keyboardType: "phone-pad",
  },
  {
    key: "educationLevel",
    label: "Highest Education",
    placeholder: "Select education level",
    icon: "school",
    type: "dropdown",
  },
  {
    key: "experienceLevel",
    label: "Experience Level",
    placeholder: "Select experience level",
    icon: "work",
    type: "dropdown",
  },
  {
    key: "skills",
    label: "Skills",
    placeholder: "Select your skills",
    icon: "code",
    type: "multiselect",
  },
  {
    key: "idDocument",
    label: "Upload ID Document",
    placeholder: "Upload National ID/Passport",
    icon: "badge",
    type: "file",
  },
  {
    key: "cvDocument",
    label: "Upload CV",
    placeholder: "Upload your CV (PDF)",
    icon: "description",
    type: "file",
  },
];

export const employerProfileCompletionFields = [
  {
    key: "country",
    label: "Country",
    placeholder: "Select your country",
    icon: "location-on",
    type: "dropdown",
  },
  {
    key: "city",
    label: "City",
    placeholder: "Enter your city",
    icon: "location-city",
  },
  {
    key: "phone",
    label: "Phone Number (Optional)",
    placeholder: "Enter company phone",
    icon: "phone",
    keyboardType: "phone-pad",
  },
  {
    key: "companyAddress",
    label: "Company Address",
    placeholder: "Enter full company address",
    icon: "home",
    multiline: true,
  },
  {
    key: "businessLicense",
    label: "Business License/Tax ID",
    placeholder: "Upload business license",
    icon: "receipt",
    type: "file",
  },
  {
    key: "verificationDocument",
    label: "Verification Document",
    placeholder: "Upload verification document",
    icon: "verified",
    type: "file",
  },
];
