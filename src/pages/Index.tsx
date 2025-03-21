
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, BarChart2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 py-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              Fraud Detection & Monitoring
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Protect Your Business from Fraud
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-8">
              Advanced fraud detection, alerting, and monitoring system with powerful analytics and customizable rules.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="group"
              >
                View Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/rules')}
              >
                Configure Rules
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 bg-blue-500/5 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 bg-blue-500/5 w-96 h-96 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Our comprehensive fraud detection system provides the tools you need to identify and prevent fraudulent transactions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Custom Rule Configuration',
                description: 'Set up and customize fraud detection rules based on your business needs.',
                icon: Shield,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: 'Real-time Monitoring',
                description: 'Monitor transactions and fraud alerts in real-time with detailed analytics.',
                icon: BarChart2,
                color: 'bg-green-50 text-green-600'
              },
              {
                title: 'Fraud Analysis & Reporting',
                description: 'Gain insights with detailed analysis of fraud patterns and performance metrics.',
                icon: AlertTriangle,
                color: 'bg-amber-50 text-amber-600'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 card-shadow hover:shadow-md transition-shadow"
              >
                <div className={cn('p-3 rounded-lg w-fit mb-4', feature.color)}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to enhance your fraud prevention?
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 mb-8">
            Get started with our fraud detection system today and protect your business from financial losses.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
