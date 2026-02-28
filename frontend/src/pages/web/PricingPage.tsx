import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingCard = ({ name, price, description, features, highlighted }: any) => (
    <div className={`p-8 rounded-3xl border transition-all duration-300 ${highlighted
            ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105 z-10'
            : 'bg-white text-slate-900 border-slate-200 shadow-sm hover:border-blue-200'
        }`}>
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className={`text-sm mb-6 ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        <div className="flex items-baseline mb-8">
            <span className="text-4xl font-semibold tracking-tight">Rs. {price}</span>
            <span className={`text-sm ml-2 ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{price === "0" ? "/ forever" : "/ one-time"}</span>
        </div>
        <ul className="space-y-4 mb-10">
            {features.map((feature: any, idx: number) => (
                <li key={idx} className="flex items-center space-x-3 text-sm font-medium">
                    <Check size={18} className={highlighted ? 'text-blue-400' : 'text-blue-600'} />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <Link
            to="/register"
            className={`block text-center py-4 rounded-2xl font-medium transition-all ${highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
        >
            {price === "0" ? "Start for Free" : "Upgrade to Premium"}
        </Link>
    </div>
);

const PricingPage = () => {
    return (
        <div className="py-24 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">Simple Pricing, No Hidden Fees</h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Choose the package that helps you reach your preferred station faster.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <PricingCard
                        name="Basic"
                        price="0"
                        description="Perfect for finding a partner in the same hospital or direct swap."
                        features={[
                            "2-Way Direct Matching",
                            "NIC Identity Verification",
                            "Station Preference (Up to 3)",
                            "Search & Filter Vacancies",
                            "Dashboard Access (with Ads)"
                        ]}
                        highlighted={false}
                    />
                    <PricingCard
                        name="Premium"
                        price="1,500"
                        description="Our most popular plan for complex circular transfers."
                        features={[
                            "2-Way & 3-Way Dynamic Matching",
                            "Unlimited Station Preferences",
                            "Priority Status in Search",
                            "No Advertisements",
                            "Dashboard Match History",
                            "Priority Customer Support"
                        ]}
                        highlighted={true}
                    />
                </div>

                <div className="mt-24 p-12 bg-slate-50 rounded-[40px] border border-slate-100 text-center max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
                    <div className="grid md:grid-cols-2 gap-8 text-left mt-12">
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">Can I upgrade later?</h4>
                            <p className="text-sm text-slate-600">Yes, you can upgrade from Basic to Premium at any time from your dashboard settings.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">What happens after 1,500 LKR?</h4>
                            <p className="text-sm text-slate-600">Premium is a one-time fee. There are no monthly subscriptions or recurring charges.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">Is my NIC data safe?</h4>
                            <p className="text-sm text-slate-600">All data is encrypted and only used for verifying your eligibility as a government employee.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">How long is the listing active?</h4>
                            <p className="text-sm text-slate-600">Your profile stays active until you successfully find a match or manually disable it.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
