import { FaXTwitter, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa6';

export const platformRules = {
  twitter: {
    name: 'Twitter',
    limit: 280,
    color: '#1DA1F2',
    icon: <FaXTwitter />,
  },
  instagram: {
    name: 'Instagram',
    limit: 2200,
    color: '#E4405F',
    icon: <FaInstagram />,
  },
  facebook: {
    name: 'Facebook',
    limit: 63206,
    color: '#1877F2',
    icon: <FaFacebook />,
  },
  linkedin: {
    name: 'LinkedIn',
    limit: 3000,
    color: '#0A66C2',
    icon: <FaLinkedin />,
  },
};
