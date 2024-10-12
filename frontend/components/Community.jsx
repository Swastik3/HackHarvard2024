import React, { useState } from 'react';
import styled from 'styled-components';

const CommunityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const ProfileCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
`;

const mockProfiles = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/150?img=1", interests: ["Anxiety", "Meditation"] },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/150?img=2", interests: ["Depression", "Exercise"] },
  { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3", interests: ["Stress", "Yoga"] },
  { id: 4, name: "Diana", avatar: "https://i.pravatar.cc/150?img=4", interests: ["ADHD", "Mindfulness"] },
];

function Community() {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);

  const handleSearch = () => {
    // Simulate API call
    setTimeout(() => {
      const filteredProfiles = mockProfiles.filter(profile =>
        profile.interests.some(interest =>
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setProfiles(filteredProfiles);
    }, 500);
  };

  return (
    <CommunityContainer>
      <h2>Find Your Community</h2>
      <SearchInput
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search by interest (e.g., Anxiety, Depression)"
      />
      <button onClick={handleSearch}>Search</button>
      <ProfileGrid>
        {profiles.map(profile => (
          <ProfileCard key={profile.id}>
            <Avatar src={profile.avatar} alt={profile.name} />
            <h3>{profile.name}</h3>
            <p>{profile.interests.join(", ")}</p>
          </ProfileCard>
        ))}
      </ProfileGrid>
    </CommunityContainer>
  );
}

export default Community;