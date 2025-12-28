import React, { useState } from 'react';
import { FaCalendar, FaUser, FaArrowRight, FaClock } from 'react-icons/fa';

const Blogs = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      id: 1,
      title: 'The Art of Draping: 10 Different Saree Styles for Every Occasion',
      excerpt: 'Discover the various ways to drape a saree and find the perfect style for your body type and occasion. From the classic Nivi drape to the modern lehenga style...',
      image: 'https://images.unsplash.com/photo-1583391265337-f5c8e5640b82?w=600',
      author: 'Priya Sharma',
      date: '2024-01-15',
      category: 'Style Guide',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Understanding Banarasi Silk: A Complete Guide',
      excerpt: 'Learn about the rich history and intricate craftsmanship behind Banarasi silk sarees. Discover what makes these sarees special and how to identify authentic pieces...',
      image: 'https://images.unsplash.com/photo-1610030469664-3f4f5f8b0d1d?w=600',
      author: 'Anjali Reddy',
      date: '2024-01-10',
      category: 'Fabric Guide',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'How to Care for Your Silk Sarees: Essential Tips',
      excerpt: 'Proper care can make your silk sarees last for generations. Learn the dos and don\'ts of silk saree maintenance, storage tips, and cleaning methods...',
      image: 'https://images.unsplash.com/photo-1617627143684-8d3f9b4e7f1c?w=600',
      author: 'Kavya Iyer',
      date: '2024-01-05',
      category: 'Care Tips',
      readTime: '4 min read'
    },
    {
      id: 4,
      title: 'Trending Saree Colors for the Wedding Season',
      excerpt: 'Stay ahead of the fashion curve with our guide to the hottest saree colors this wedding season. From jewel tones to pastels, find your perfect shade...',
      image: 'https://images.unsplash.com/photo-1583391733981-5f5c1b34e90a?w=600',
      author: 'Priya Sharma',
      date: '2023-12-28',
      category: 'Fashion Trends',
      readTime: '6 min read'
    },
    {
      id: 5,
      title: 'Kanjivaram vs Banarasi: Understanding the Difference',
      excerpt: 'Two of India\'s most celebrated silk sarees - but what makes them unique? Explore the distinct characteristics, history, and weaving techniques of both...',
      image: 'https://images.unsplash.com/photo-1596461123522-e4d49838bb90?w=600',
      author: 'Anjali Reddy',
      date: '2023-12-20',
      category: 'Fabric Guide',
      readTime: '8 min read'
    },
    {
      id: 6,
      title: 'Sustainable Fashion: The Rise of Handloom Sarees',
      excerpt: 'Discover how choosing handloom sarees contributes to sustainable fashion and supports local artisan communities. Learn about eco-friendly fabric options...',
      image: 'https://images.unsplash.com/photo-1610030469671-11c1b0e2825f?w=600',
      author: 'Kavya Iyer',
      date: '2023-12-15',
      category: 'Sustainability',
      readTime: '5 min read'
    },
    {
      id: 7,
      title: 'Accessorizing Your Saree: The Ultimate Guide',
      excerpt: 'Complete your saree look with the right accessories. From jewelry to footwear, learn how to pair accessories with different types of sarees...',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',
      author: 'Priya Sharma',
      date: '2023-12-10',
      category: 'Style Guide',
      readTime: '6 min read'
    },
    {
      id: 8,
      title: 'Cotton Sarees: Perfect for Every Day Elegance',
      excerpt: 'Explore the versatility of cotton sarees and why they\'re perfect for daily wear. Discover different varieties and styling tips for casual occasions...',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901145?w=600',
      author: 'Anjali Reddy',
      date: '2023-12-05',
      category: 'Fabric Guide',
      readTime: '4 min read'
    }
  ];

  const categories = ['all', 'Style Guide', 'Fabric Guide', 'Care Tips', 'Fashion Trends', 'Sustainability'];

  const filteredBlogs = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-20">
        <div className="max-w-[1600px] mx-auto px-3 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Our Blog</h1>
          <p className="text-xl text-amber-100 max-w-3xl mx-auto">
            Discover the latest trends, styling tips, and stories from the world of sarees
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 py-12">
        {/* Featured Post */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Post</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-96 lg:h-auto">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                  {featuredPost.category}
                </span>
                <h3 className="text-3xl font-bold text-gray-800 mb-4 hover:text-amber-700 transition-colors cursor-pointer">
                  {featuredPost.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-amber-600" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-amber-600" />
                      {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-amber-600" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <button className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all flex items-center gap-2 w-fit font-semibold">
                  Read More <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {selectedCategory === 'all' ? 'All Posts' : selectedCategory}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.slice(1).map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-amber-700 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-amber-600" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-amber-600" />
                      {post.readTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FaCalendar className="text-amber-600" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button className="text-amber-700 hover:text-amber-800 font-semibold text-sm flex items-center gap-1">
                      Read More <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blogs;
