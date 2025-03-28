import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  genre: string;
  imageUrl: string;
  description: string;
}

const ArtistPage: React.FC = () => {
  // Mock data for artists
  const artists: Artist[] = [
    {
      id: '1',
      name: 'Nom de l\'artiste',
      genre: 'Genre musical',
      imageUrl: 'https://via.placeholder.com/300',
      description: 'Description de l\'artiste et de son style musical.'
    },
    {
      id: '2',
      name: 'Nom de l\'artiste',
      genre: 'Genre musical',
      imageUrl: 'https://via.placeholder.com/300',
      description: 'Description de l\'artiste et de son style musical.'
    },
    {
      id: '3',
      name: 'Nom de l\'artiste',
      genre: 'Genre musical',
      imageUrl: 'https://via.placeholder.com/300',
      description: 'Description de l\'artiste et de son style musical.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nos Artistes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {artists.map((artist) => (
          <div key={artist.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={artist.imageUrl} 
              alt={artist.name} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{artist.name}</h2>
              <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full mb-4">
                {artist.genre}
              </span>
              <p className="text-gray-600 mb-4">{artist.description}</p>
              <Link 
                to={`/artists/${artist.id}`} 
                className="flex items-center text-black font-medium hover:underline"
              >
                Voir plus <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistPage;