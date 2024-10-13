import React from 'react';
import { Phone, Heart, Shield } from 'lucide-react';
import AppPic from '../AppPic.png';

const SeekHelpPage = () => {
  return (
    <div className="flex-1 p-4 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-3xl font-bold">Download Our App</h2>
            </div>
        <div className="bg-gray-100 rounded-lg p-6">
        <div className="pt-3">
          <p className="text-xl mb- text-gray-700">
            If you need immediate assistance, please use our mobile app to instantly connect with over 100 hotlines.
          </p>
          
            <h2 className="text-2xl font-semibold mb-4 text-blue-600"></h2>
            <div className="flex justify-center">
              <img src={AppPic} alt="Our App" className="rounded max-w-full h-auto" style={{maxHeight: '600px'}} />
            </div>

            <div className="flex justify-center space-x-12">
            <div className="flex flex-col items-center">
              <Phone size={40} className="mb-2 text-blue-600" />
              <span className="text-sm font-medium">Instant Access</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart size={40} className="mb-2 text-blue-600" />
              <span className="text-sm font-medium">Compassionate Care</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield size={40} className="mb-2 text-blue-600" />
              <span className="text-sm font-medium">Safe & Secure</span>
            </div>
          </div>
          </div>
        
          
        </div>
      </div>
    </div>
  );
};

export default SeekHelpPage;