import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
    CreditCard,
    Calendar,
    IndianRupee,
    CheckCircle,
    XCircle,
    Clock,
    Download
} from "lucide-react";

interface PaymentTransaction {
    id: string;
    booking_id: string;
    car_name: string;
    amount: number;
    payment_method: string;
    payment_type: 'minimum' | 'full';
    status: 'paid' | 'pending' | 'failed';
    transaction_id: string; // Razorpay payment ID
    created_at: string;
}

const PaymentHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchPayments();
    }, [user, navigate]);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            // Fetch from dedicated payments endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/my-payments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success && data.payments) {
                const mappedPayments: PaymentTransaction[] = data.payments.map((payment: any) => ({
                    id: payment.id,
                    booking_id: payment.bookings?.booking_id || 'N/A',
                    car_name: payment.bookings?.vehicles?.name || 'Unknown Car',
                    amount: payment.amount,
                    payment_method: payment.payment_method || 'Razorpay',
                    payment_type: 'full', // Default or derive if available
                    status: payment.payment_status || 'paid',
                    transaction_id: payment.gateway_payment_id || payment.payment_id || 'N/A',
                    created_at: payment.created_at
                }));

                setPayments(mappedPayments);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <section className="bg-hero-gradient text-primary-foreground py-16 pt-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Payment History</h1>
                        <p className="text-xl text-primary-foreground/90">
                            View your transaction history and download receipts
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4">
                    <Card className="max-w-5xl mx-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Transactions
                            </CardTitle>
                            <CardDescription>
                                Your recent payments and refunds
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : payments.length > 0 ? (
                                <div className="space-y-4">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-primary/10 rounded-full">
                                                    <IndianRupee className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{payment.car_name}</p>
                                                    <p className="text-sm text-muted-foreground">Booking #{payment.booking_id}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{formatDate(payment.created_at)}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-lg">₹{payment.amount.toLocaleString('en-IN')}</p>
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">{payment.payment_type}</Badge>
                                                    {getStatusBadge(payment.status)}
                                                </div>
                                                <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs" onClick={() => window.print()}>
                                                    <Download className="h-3 w-3 mr-1" />
                                                    Receipt
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                                    <p className="text-muted-foreground">You haven't made any payments yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default PaymentHistory;
