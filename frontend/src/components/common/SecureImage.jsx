import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SecureImage = ({ src, alt, className, fallbackSrc }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    
    const fetchImage = async () => {
      if (!src) return;
      
      try {
        setLoading(true);
        // Ensure we don't duplicate /api if the src already includes it
        let requestUrl = src;
        if (requestUrl.startsWith('/api/')) {
            requestUrl = requestUrl.substring(4); // Remove '/api'
        }
        
        // We use our api interceptor which automatically attaches the JWT token
        const response = await api.get(requestUrl, {
          responseType: 'blob'
        });
        
        objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
        setError(false);
      } catch (err) {
        console.error('Failed to load secure image', err);
        setError(true);
        if (fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Cleanup the object URL to avoid memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, fallbackSrc]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 flex items-center justify-center ${className}`}>
        <span className="text-slate-400">Loading...</span>
      </div>
    );
  }

  if (error && !fallbackSrc) {
    return (
      <div className={`bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center ${className}`}>
        <span className="text-rose-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};

export default SecureImage;
