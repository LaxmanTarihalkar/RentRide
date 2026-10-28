import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { 
  Car, 
  Building2, 
  FileText, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerOwner } from "@/services/ownerService";

interface FormData {
  // Business Information
  businessType: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Fleet Information
  totalCars: string;
  carTypes: string[];
  operatingYears: string;
  
  // Documents
  businessLicense: File | null;
  gstCertificate: File | null;
  insuranceCertificate: File | null;
  ownerIdProof: File | null;
  
  // Additional Information
  description: string;
  website: string;
  socialMedia: string;
  
  // Terms
  agreeToTerms: boolean;
  agreeToVerification: boolean;
}

export const RentOut = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessType: "",
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    totalCars: "",
    carTypes: [],
    operatingYears: "",
    businessLicense: null,
    gstCertificate: null,
    insuranceCertificate: null,
    ownerIdProof: null,
    description: "",
    website: "",
    socialMedia: "",
    agreeToTerms: false,
    agreeToVerification: false,
  });

  const businessTypes = [
    { value: "individual", label: "Individual Car Owner" },
    { value: "agency", label: "Car Rental Agency" },
    { value: "company", label: "Fleet Company" },
    { value: "dealership", label: "Car Dealership" },
  ];

  const carTypeOptions = [
    "Sedan", "SUV", "Hatchback", "Luxury", "Sports", "Electric", "Hybrid", "Van", "Truck"
  ];

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCarTypeToggle = (carType: string) => {
    setFormData(prev => ({
      ...prev,
      carTypes: prev.carTypes.includes(carType)
        ? prev.carTypes.filter(type => type !== carType)
        : [...prev.carTypes, carType]
    }));
  };

  const handleFileUpload = (field: keyof FormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.businessType && formData.businessName && formData.ownerName && 
                 formData.email && formData.phone);
      case 2:
        return !!(formData.address && formData.city && formData.state && formData.pincode);
      case 3:
        return !!(formData.totalCars && formData.carTypes.length > 0 && formData.operatingYears);
      case 4:
        return !!(formData.businessLicense && formData.ownerIdProof);
      case 5:
        return formData.agreeToTerms && formData.agreeToVerification;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all required fields and accept the terms.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Submit owner registration data
      const result = await registerOwner({
        businessType: formData.businessType,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        totalCars: formData.totalCars,
        carTypes: formData.carTypes,
        operatingYears: formData.operatingYears,
        description: formData.description,
        website: formData.website,
        socialMedia: formData.socialMedia
      });

      if (result.success) {
        toast({
          title: "Application Submitted!",
          description: "Your rental partner application has been submitted successfully. We'll review it within 2-3 business days.",
        });
        
        // Redirect to home page after successful submission
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Business Information</h3>
              <p className="text-gray-400">Tell us about your business</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessType" className="text-gray-200">Business Type *</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {businessTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-600">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="businessName" className="text-gray-200">Business/Agency Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="ownerName" className="text-gray-200">Owner/Manager Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Enter owner/manager name"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-200">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="business@example.com"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-200">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="alternatePhone" className="text-gray-200">Alternate Phone Number</Label>
                <Input
                  id="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  placeholder="+91 98765 43211"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Address Information</h3>
              <p className="text-gray-400">Where is your business located?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-gray-200">Business Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete business address"
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-gray-200">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter city"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-gray-200">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {indianStates.map(state => (
                        <SelectItem key={state} value={state} className="text-white hover:bg-gray-600">
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="pincode" className="text-gray-200">PIN Code *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  placeholder="Enter 6-digit PIN code"
                  maxLength={6}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Car className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Fleet Information</h3>
              <p className="text-gray-400">Tell us about your vehicles</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalCars" className="text-gray-200">Total Number of Cars *</Label>
                  <Select value={formData.totalCars} onValueChange={(value) => handleInputChange('totalCars', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="1-5" className="text-white hover:bg-gray-600">1-5 cars</SelectItem>
                      <SelectItem value="6-10" className="text-white hover:bg-gray-600">6-10 cars</SelectItem>
                      <SelectItem value="11-25" className="text-white hover:bg-gray-600">11-25 cars</SelectItem>
                      <SelectItem value="26-50" className="text-white hover:bg-gray-600">26-50 cars</SelectItem>
                      <SelectItem value="50+" className="text-white hover:bg-gray-600">50+ cars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="operatingYears" className="text-gray-200">Years in Business *</Label>
                  <Select value={formData.operatingYears} onValueChange={(value) => handleInputChange('operatingYears', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="new" className="text-white hover:bg-gray-600">New Business</SelectItem>
                      <SelectItem value="1-2" className="text-white hover:bg-gray-600">1-2 years</SelectItem>
                      <SelectItem value="3-5" className="text-white hover:bg-gray-600">3-5 years</SelectItem>
                      <SelectItem value="6-10" className="text-white hover:bg-gray-600">6-10 years</SelectItem>
                      <SelectItem value="10+" className="text-white hover:bg-gray-600">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-200">Car Types Available *</Label>
                <p className="text-sm text-gray-400 mb-3">Select all types of cars you have</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {carTypeOptions.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.carTypes.includes(type)}
                        onCheckedChange={() => handleCarTypeToggle(type)}
                        className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor={type} className="text-sm text-gray-200 cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
                {formData.carTypes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.carTypes.map(type => (
                      <Badge key={type} variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">{type}</Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="description" className="text-gray-200">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your business, services, and what makes you special..."
                  rows={4}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website" className="text-gray-200">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="socialMedia" className="text-gray-200">Social Media (Optional)</Label>
                  <Input
                    id="socialMedia"
                    value={formData.socialMedia}
                    onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                    placeholder="Instagram, Facebook, etc."
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Document Verification</h3>
              <p className="text-gray-400">Upload required documents for verification</p>
            </div>
            
            <div className="space-y-6">
              <DocumentUpload
                label="Business License/Registration *"
                description="Upload your business registration certificate or trade license"
                file={formData.businessLicense}
                onFileChange={(file) => handleFileUpload('businessLicense', file)}
                required
              />
              
              <DocumentUpload
                label="Owner ID Proof *"
                description="Upload Aadhaar Card, PAN Card, or Driving License"
                file={formData.ownerIdProof}
                onFileChange={(file) => handleFileUpload('ownerIdProof', file)}
                required
              />
              
              <DocumentUpload
                label="GST Certificate"
                description="Upload GST registration certificate (if applicable)"
                file={formData.gstCertificate}
                onFileChange={(file) => handleFileUpload('gstCertificate', file)}
              />
              
              <DocumentUpload
                label="Insurance Certificate"
                description="Upload comprehensive insurance certificate for your fleet"
                file={formData.insuranceCertificate}
                onFileChange={(file) => handleFileUpload('insuranceCertificate', file)}
              />
            </div>
            
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-white">Document Guidelines</h4>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    <li>• All documents should be clear and readable</li>
                    <li>• Accepted formats: PDF, JPG, PNG (Max 5MB each)</li>
                    <li>• Documents should be valid and not expired</li>
                    <li>• Business name should match across all documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white">Terms & Verification</h3>
              <p className="text-gray-400">Review and accept our terms</p>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-200">Business Type:</span>
                      <p className="text-gray-400">{businessTypes.find(t => t.value === formData.businessType)?.label}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-200">Business Name:</span>
                      <p className="text-gray-400">{formData.businessName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-200">Owner Name:</span>
                      <p className="text-gray-400">{formData.ownerName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-200">Total Cars:</span>
                      <p className="text-gray-400">{formData.totalCars}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-200">Location:</span>
                      <p className="text-gray-400">{formData.city}, {formData.state}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-200">Experience:</span>
                      <p className="text-gray-400">{formData.operatingYears}</p>
                    </div>
                  </div>
                  
                  {formData.carTypes.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-200">Car Types:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.carTypes.map(type => (
                          <Badge key={type} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed text-gray-200">
                    I agree to the{" "}
                    <button type="button" className="text-blue-400 hover:underline">
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button type="button" className="text-blue-400 hover:underline">
                      Partner Agreement
                    </button>
                    . I understand the commission structure and payment terms.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToVerification"
                    checked={formData.agreeToVerification}
                    onCheckedChange={(checked) => handleInputChange('agreeToVerification', checked)}
                  />
                  <Label htmlFor="agreeToVerification" className="text-sm leading-relaxed text-gray-200">
                    I consent to document verification and background checks. I understand that RentRide may contact me for additional information and site visits.
                  </Label>
                </div>
              </div>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">What happens next?</h4>
                    <ul className="text-sm text-gray-300 mt-2 space-y-1">
                      <li>• We'll review your application within 2-3 business days</li>
                      <li>• Our team may contact you for additional information</li>
                      <li>• Site visit may be scheduled for verification</li>
                      <li>• Once approved, you'll receive onboarding instructions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar forceBackground={true} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
        <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Become a RentRide Partner
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join our network of trusted car rental partners and grow your business with RentRide's platform
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step}
                </div>
                {step < 5 && (
                  <div className={`h-1 w-full mx-4 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Business Info</span>
            <span>Address</span>
            <span>Fleet Details</span>
            <span>Documents</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-600">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
};

// Document Upload Component
interface DocumentUploadProps {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
}

const DocumentUpload = ({ label, description, file, onFileChange, required = false }: DocumentUploadProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-700/50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {file ? (
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
        </div>
        
        <h4 className="font-medium mb-2 text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </h4>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        
        {file ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-400">✓ {file.name}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFileChange(null)}
              className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
            >
              Remove File
            </Button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id={`file-${label}`}
            />
            <Label htmlFor={`file-${label}`} className="cursor-pointer">
              <Button variant="outline" asChild className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500">
                <span>
                  <Camera className="w-4 h-4 mr-2" />
                  Choose File
                </span>
              </Button>
            </Label>
            <p className="text-xs text-gray-400 mt-2">
              PDF, JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};