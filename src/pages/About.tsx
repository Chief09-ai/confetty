import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const About = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">About Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>Our Mission</h2>
            <p>
              We are building a platform that brings people together through meaningful discussions 
              and shared interests. Our goal is to create a space where everyone can contribute, 
              learn, and connect with others in their community.
            </p>

            <h2>What We Do</h2>
            <p>
              Our platform allows users to create posts, engage in discussions, and build communities 
              around topics they care about. Whether you're interested in technology, gaming, or 
              general conversation, there's a place for you here.
            </p>

            <h2>Our Values</h2>
            <ul>
              <li><strong>Community First:</strong> We prioritize the needs and safety of our community members</li>
              <li><strong>Open Discussion:</strong> We encourage respectful dialogue and diverse perspectives</li>
              <li><strong>Quality Content:</strong> We promote meaningful contributions and constructive engagement</li>
              <li><strong>User Privacy:</strong> We respect and protect our users' personal information</li>
            </ul>

            <h2>Join Our Community</h2>
            <p>
              We're excited to have you as part of our growing community. Create an account to start 
              posting, commenting, and connecting with others who share your interests.
            </p>

            <h2>Get Involved</h2>
            <p>
              Looking to contribute more? Consider creating a new sub-community, helping moderate 
              discussions, or simply sharing quality content that others will find valuable.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;