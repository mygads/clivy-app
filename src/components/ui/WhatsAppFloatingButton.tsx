'use client';

import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from './button';
import { FaWhatsapp } from 'react-icons/fa';


interface WhatsAppFloatingButtonProps {
  phoneNumber: string;
  message?: string;
  className?: string;
}

const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber,
  message = "Hi! I'm interested in your services",
  className = ""
}) => {
  const handleWhatsAppClick = () => {
    // Format phone number (remove any non-numeric characters except +)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Create WhatsApp URL with pre-filled message
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={`
        fixed bottom-6 right-8 z-50 
        w-12 h-12 rounded-full 
        bg-green-500 hover:bg-green-600 
        text-white shadow-lg hover:shadow-xl 
        transition-all duration-300 
        flex items-center justify-center
        group hover:animate-none
        ${className}
      `}
      size="icon"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8group-hover:scale-120 transition-transform duration-200" />
    </Button>
  );
};

export default WhatsAppFloatingButton;