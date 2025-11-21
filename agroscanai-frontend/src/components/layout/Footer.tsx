import React from 'react';
import type { Page } from '../../types'; 
import { IconLeaf, IconMailInternal, IconLocation } from '../ui/Icons';

const Footer: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  return (
    <footer className="bg-green-800 text-green-200 py-10 border-t border-green-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="text-white text-xl font-extrabold flex items-center space-x-2 mb-3">
            <IconLeaf className="text-amber-500 h-5 w-5" />
            <span>AgroScan AI</span>
          </div>
          <p className="text-sm">Precision diagnosis for a healthier harvest.</p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => setCurrentPage('landing')} className="hover:text-amber-500 transition-colors">Home</button></li>
            <li><button onClick={() => setCurrentPage('auth')} className="hover:text-amber-500 transition-colors">Features</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
          <div className="space-y-2 text-sm">
            <p className="flex items-center space-x-2"><IconMailInternal className="h-4 w-4 text-amber-500" /><span>support@agroscan.ai</span></p>
            <p className="flex items-start space-x-2"><IconLocation className="h-4 w-4 text-amber-500 mt-1" /><span>Global HQ, AgTech Hub</span></p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-green-700 text-center text-sm text-green-400">
        &copy; {new Date().getFullYear()} AgroScan AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;