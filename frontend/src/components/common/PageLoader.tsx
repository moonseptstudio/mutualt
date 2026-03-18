import React from 'react';
import logoImg from '../../assets/logos/logo.jpg';

interface PageLoaderProps {
    fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ fullScreen = true }) => {
    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'h-full flex-1'} w-full flex items-center justify-center bg-(--bg-main) z-50`}>
            <div className="relative flex flex-col items-center">
                {/* Pulsating background ring */}
                <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl animate-bounce"></div>
                
                {/* Adding a gentle bounce and pulse to the logo */}
                <div className="animate-bounce relative z-10 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center drop-shadow-2xl rounded-full overflow-hidden bg-white p-1">
                    <img src={logoImg} alt="Mutual Transfer" className="w-full h-full object-contain rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
