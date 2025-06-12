export async function generateStaticParams() {
  try {
    const res = await fetch('http://localhost:1337/api/stories?populate=*&pagination[page]=1&pagination[pageSize]=200');
    const data = await res.json();
    
    return data.data.map((story) => ({
      story: story.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
} 