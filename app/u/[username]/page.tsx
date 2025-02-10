'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Page = () => {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };


  const handleSendMessage = async () => {
    if (content.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please provide both username and message!',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/send-message', {
        username,
        content,
      });

      if (response.status === 200) {
        toast({
          title: 'Message Sent',
          description: 'Your message was sent successfully!',
        });
        setContent('');
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to send the message.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async (username: string) => {
    try {
      const response = await axios.post('/api/suggest-messages', {"message": username});
      const data = response.data;
      const rawText = data.text;
      const cleanedText = rawText.replace(/^"|"$/g, '').trim();
      const suggestionsArray = cleanedText
        .split('?')
        .map((sentence:string) => sentence.trim())
        .filter((sentence:string) => sentence.length > 2);

      const formattedSuggestions = suggestionsArray.map((sentence:string, index:number) => {
        if (index === suggestionsArray.length - 1) {
          return sentence; 
        }
        return sentence + '?';
      });

      setSuggestedMessages(formattedSuggestions);
    } catch (error) {
      console.error('Failed to fetch suggested messages:', error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchSuggestedMessages(username);
    } else {
      console.error('Username is not defined');
    }
  }, [username]);

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Send a message to: {username}</h1>
      <div className="flex flex-col gap-4">
        
        <Input
          id="anonymousMessage"
          type="text"
          value={content}
          onChange={handleInputChange}
          placeholder="Type your message here"
          className="p-2 border rounded"
        />
        <Button
          onClick={handleSendMessage}
          className="bg-slate-950 text-white p-2 rounded hover:bg-slate-800"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">AI Suggested messages based on username</h2>
        <div className="flex flex-col gap-2">
          {suggestedMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-left"
              onClick={() => setContent(message)}
            >
              {message}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
