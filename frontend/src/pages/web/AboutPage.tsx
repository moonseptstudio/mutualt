import { ShieldCheck, Target, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ValueCard = ({ icon: Icon, title, description }: any) => (
    <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <Icon size={32} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
);

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-slate-50 py-24 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-6 tracking-tight">Our Mission</h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Reducing the administrative burden for over 1.5 million government employees in Sri Lanka through technology-driven mutual matching.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-semibold text-slate-900 mb-6 tracking-tight">Why We Built This</h2>
                        <div className="space-y-6 text-slate-600 leading-relaxed">
                            <p>
                                As government employees, finding a mutual transfer can often take years of searching through social media groups, manual advertisements, and personal networks.
                            </p>
                            <p>
                                MutualTransfer.lk was born out of a desire to simplify this process. We believe that every teacher, nurse, and doctor should be able to serve where they feel most productive and supported by their families.
                            </p>
                            <p>
                                Our platform uses advanced graph algorithms to find not just direct 1-to-1 matches, but complex circular chains that would be impossible to discover manually.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-600 rounded-3xl h-64 flex items-end p-6 text-white overflow-hidden relative">
                            <span className="text-5xl font-medium opacity-20 absolute top-0 -left-4">01</span>
                            <p className="font-bold relative z-10">Efficient Matching</p>
                        </div>
                        <div className="bg-slate-100 rounded-3xl h-64 flex items-end p-6 text-slate-900 overflow-hidden relative">
                            <span className="text-5xl font-medium opacity-5 absolute top-0 -left-4">02</span>
                            <p className="font-bold relative z-10">Transparent Process</p>
                        </div>
                        <div className="bg-slate-900 rounded-3xl h-64 flex items-end p-6 text-white overflow-hidden relative col-span-2">
                            <span className="text-5xl font-medium opacity-20 absolute top-0 -left-4">03</span>
                            <p className="font-bold relative z-10 text-xl">Government-Wide Network</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-slate-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-semibold text-slate-900 mb-4 tracking-tight">Our Core Values</h2>
                        <p className="text-slate-600">The principles that guide our platform development.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <ValueCard
                            icon={ShieldCheck}
                            title="Integrity"
                            description="Ensuring all profiles are verified and transparent."
                        />
                        <ValueCard
                            icon={Target}
                            title="Precision"
                            description="Developing highly accurate matching algorithms."
                        />
                        <ValueCard
                            icon={Users}
                            title="Community"
                            description="Built by government employees, for government employees."
                        />
                        <ValueCard
                            icon={Heart}
                            title="Impact"
                            description="Improving work-life balance for public service professionals."
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-semibold text-slate-900 mb-8 tracking-tight">Ready to find your match?</h2>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link to="/register" className="px-10 py-5 bg-blue-600 text-white font-medium rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
                            Create an Account
                        </Link>
                        <Link to="/pricing" className="px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl border-2 border-slate-100 hover:border-blue-100 transition-all">
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
