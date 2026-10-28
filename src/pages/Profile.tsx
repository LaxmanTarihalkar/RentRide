import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Camera,
  Save,
  Edit,
  Shield,
  CreditCard,
  IdCard,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "+91 98765 43210",
    dateOfBirth: "1990-01-15",
    address: "123 MG Road, Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
  });

  // KYC documents state
  const [kycDocuments, setKycDocuments] = useState({
    drivingLicense: {
      uploaded: true,
      verified: true,
      fileName: "driving_license.pdf",
      uploadDate: "2024-01-15",
    },
    aadharCard: {
      uploaded: true,
      verified: false,
      fileName: "aadhar_card.pdf",
      uploadDate: "2024-01-20",
    },
    panCard: {
      uploaded: false,
      verified: false,
      fileName: "",
      uploadDate: "",
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleFileUpload = (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      setKycDocuments({
        ...kycDocuments,
        [documentType]: {
          uploaded: true,
          verified: false,
          fileName: file.name,
          uploadDate: new Date().toISOString().split("T")[0],
        },
      });
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully. Verification pending.`,
      });
    }
  };

  const getInitials = () => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
  };

  const getVerificationStatus = () => {
    const totalDocs = 3;
    const verifiedDocs = Object.values(kycDocuments).filter((doc) => doc.verified).length;
    return { verified: verifiedDocs, total: totalDocs };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <section className="relative bg-hero-gradient text-primary-foreground py-16 pt-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">My Profile</h1>
            <p className="text-xl text-primary-foreground/90">
              Manage your account and documents
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-3xl bg-accent text-accent-foreground">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-0 right-0 rounded-full"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* User Info */}
                      <div>
                        <h2 className="text-2xl font-bold">
                          {profileData.firstName} {profileData.lastName}
                        </h2>
                        <p className="text-muted-foreground">{profileData.email}</p>
                      </div>

                      {/* Verification Status */}
                      <div className="w-full pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">KYC Status</span>
                          <Badge
                            variant={
                              verificationStatus.verified === verificationStatus.total
                                ? "default"
                                : "secondary"
                            }
                            className={
                              verificationStatus.verified === verificationStatus.total
                                ? "bg-green-500"
                                : ""
                            }
                          >
                            {verificationStatus.verified}/{verificationStatus.total} Verified
                          </Badge>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full transition-all"
                            style={{
                              width: `${(verificationStatus.verified / verificationStatus.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Member Since */}
                      <div className="w-full pt-4 border-t text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Member since Jan 2024</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">
                      <User className="h-4 w-4 mr-2" />
                      Personal Info
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      <Shield className="h-4 w-4 mr-2" />
                      KYC Documents
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                              Update your personal details and contact information
                            </CardDescription>
                          </div>
                          {!isEditing ? (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="hero"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="firstName"
                                  name="firstName"
                                  value={profileData.firstName}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  value={profileData.lastName}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={profileData.email}
                                  disabled
                                  className="pl-10 bg-muted"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Email cannot be changed
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="phone"
                                  name="phone"
                                  value={profileData.phone}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="dateOfBirth"
                                  name="dateOfBirth"
                                  type="date"
                                  value={profileData.dateOfBirth}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Address Info */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="address">Street Address</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="address"
                                  name="address"
                                  value={profileData.address}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  name="city"
                                  value={profileData.city}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                  id="state"
                                  name="state"
                                  value={profileData.state}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                  id="pincode"
                                  name="pincode"
                                  value={profileData.pincode}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* KYC Documents Tab */}
                  <TabsContent value="documents">
                    <Card>
                      <CardHeader>
                        <CardTitle>KYC Documents</CardTitle>
                        <CardDescription>
                          Upload your documents for verification. All documents are securely stored and encrypted.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Driving License */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-accent/10 rounded-lg">
                                <CreditCard className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <h4 className="font-semibold">Driving License</h4>
                                <p className="text-sm text-muted-foreground">
                                  Required for car rental
                                </p>
                              </div>
                            </div>
                            {kycDocuments.drivingLicense.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : kycDocuments.drivingLicense.uploaded ? (
                              <Badge variant="secondary">
                                <FileText className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Uploaded
                              </Badge>
                            )}
                          </div>
                          {kycDocuments.drivingLicense.uploaded ? (
                            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{kycDocuments.drivingLicense.fileName}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Uploaded: {kycDocuments.drivingLicense.uploadDate}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload("drivingLicense", e)}
                                className="hidden"
                                id="dl-upload"
                              />
                              <Label htmlFor="dl-upload">
                                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
                                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm font-medium">Click to upload</p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, JPG or PNG (Max 5MB)
                                  </p>
                                </div>
                              </Label>
                            </div>
                          )}
                        </div>

                        {/* Aadhar Card */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-accent/10 rounded-lg">
                                <IdCard className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <h4 className="font-semibold">Aadhar Card</h4>
                                <p className="text-sm text-muted-foreground">
                                  Government ID proof
                                </p>
                              </div>
                            </div>
                            {kycDocuments.aadharCard.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : kycDocuments.aadharCard.uploaded ? (
                              <Badge variant="secondary">
                                <FileText className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Uploaded
                              </Badge>
                            )}
                          </div>
                          {kycDocuments.aadharCard.uploaded ? (
                            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{kycDocuments.aadharCard.fileName}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Uploaded: {kycDocuments.aadharCard.uploadDate}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload("aadharCard", e)}
                                className="hidden"
                                id="aadhar-upload"
                              />
                              <Label htmlFor="aadhar-upload">
                                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
                                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm font-medium">Click to upload</p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, JPG or PNG (Max 5MB)
                                  </p>
                                </div>
                              </Label>
                            </div>
                          )}
                        </div>

                        {/* PAN Card */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-accent/10 rounded-lg">
                                <CreditCard className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <h4 className="font-semibold">PAN Card</h4>
                                <p className="text-sm text-muted-foreground">
                                  Optional - For billing purposes
                                </p>
                              </div>
                            </div>
                            {kycDocuments.panCard.verified ? (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : kycDocuments.panCard.uploaded ? (
                              <Badge variant="secondary">
                                <FileText className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Uploaded
                              </Badge>
                            )}
                          </div>
                          {kycDocuments.panCard.uploaded ? (
                            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{kycDocuments.panCard.fileName}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Uploaded: {kycDocuments.panCard.uploadDate}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload("panCard", e)}
                                className="hidden"
                                id="pan-upload"
                              />
                              <Label htmlFor="pan-upload">
                                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
                                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm font-medium">Click to upload</p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, JPG or PNG (Max 5MB)
                                  </p>
                                </div>
                              </Label>
                            </div>
                          )}
                        </div>

                        {/* Info Box */}
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                          <div className="flex gap-3">
                            <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium mb-1">Document Security</p>
                              <p className="text-muted-foreground">
                                All documents are encrypted and stored securely. We use bank-level security to protect your information. Documents are only used for verification purposes.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Profile;