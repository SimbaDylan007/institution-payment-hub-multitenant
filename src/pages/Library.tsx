
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Home, BookOpen, Search, Plus, Users, Edit, Trash2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishedDate: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  status: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberType: string;
  membershipDate: string;
  status: string;
}

export default function Library() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchMembers();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/library/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      // Since there's no members endpoint, we'll use a placeholder
      setMembers([
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          memberType: "STUDENT",
          membershipDate: "2024-01-15",
          status: "ACTIVE"
        }
      ]);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const bookData = {
      title: formData.get('title'),
      author: formData.get('author'),
      isbn: formData.get('isbn'),
      publisher: formData.get('publisher'),
      publishedDate: formData.get('publishedDate'),
      category: formData.get('category'),
      totalCopies: parseInt(formData.get('totalCopies') as string),
      location: formData.get('location')
    };

    try {
      const url = selectedBook 
        ? `http://localhost:8080/api/library/books/${selectedBook.id}`
        : 'http://localhost:8080/api/library/books';
      
      const response = await fetch(url, {
        method: selectedBook ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });

      if (response.ok) {
        toast.success(`Book ${selectedBook ? 'updated' : 'added'} successfully`);
        setIsBookDialogOpen(false);
        setSelectedBook(null);
        fetchBooks();
      } else {
        throw new Error('Failed to save book');
      }
    } catch (error) {
      toast.error('Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/library/books/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Book deleted successfully');
        fetchBooks();
      }
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const searchBooks = async () => {
    if (!searchTerm.trim()) {
      fetchBooks();
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/library/books/search/title?title=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Library Management</h1>
            <p className="text-gray-300">Manage books, circulation, and library resources</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-purple-900 border-purple-700 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        defaultValue={selectedBook?.title || ''}
                        className="bg-purple-800 border-purple-600" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input 
                        id="author" 
                        name="author" 
                        defaultValue={selectedBook?.author || ''}
                        className="bg-purple-800 border-purple-600" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input 
                        id="isbn" 
                        name="isbn" 
                        defaultValue={selectedBook?.isbn || ''}
                        className="bg-purple-800 border-purple-600" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="publisher">Publisher</Label>
                      <Input 
                        id="publisher" 
                        name="publisher" 
                        defaultValue={selectedBook?.publisher || ''}
                        className="bg-purple-800 border-purple-600" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publishedDate">Published Date</Label>
                      <Input 
                        id="publishedDate" 
                        name="publishedDate" 
                        type="date"
                        defaultValue={selectedBook?.publishedDate || ''}
                        className="bg-purple-800 border-purple-600" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue={selectedBook?.category || ''}>
                        <SelectTrigger className="bg-purple-800 border-purple-600">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-800 border-purple-600">
                          <SelectItem value="FICTION">Fiction</SelectItem>
                          <SelectItem value="NON_FICTION">Non-Fiction</SelectItem>
                          <SelectItem value="SCIENCE">Science</SelectItem>
                          <SelectItem value="HISTORY">History</SelectItem>
                          <SelectItem value="BIOGRAPHY">Biography</SelectItem>
                          <SelectItem value="REFERENCE">Reference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalCopies">Total Copies</Label>
                      <Input 
                        id="totalCopies" 
                        name="totalCopies" 
                        type="number"
                        defaultValue={selectedBook?.totalCopies || ''}
                        className="bg-purple-800 border-purple-600" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location" 
                        defaultValue={selectedBook?.location || ''}
                        className="bg-purple-800 border-purple-600" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsBookDialogOpen(false);
                        setSelectedBook(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : (selectedBook ? 'Update' : 'Add')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-900/50 border-purple-700">
            <TabsTrigger value="catalog" className="data-[state=active]:bg-purple-600">Book Catalog</TabsTrigger>
            <TabsTrigger value="circulation" className="data-[state=active]:bg-purple-600">Circulation</TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-purple-600">Members</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-purple-600">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  Book Catalog
                </CardTitle>
                <div className="flex gap-4 items-center mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search books by title, author, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-purple-800 border-purple-600 text-white"
                    />
                  </div>
                  <Button onClick={searchBooks} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-400">{books.length}</div>
                      <p className="text-sm text-gray-300">Total Books</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-400">
                        {books.reduce((sum, book) => sum + book.availableCopies, 0)}
                      </div>
                      <p className="text-sm text-gray-300">Available</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-yellow-400">
                        {books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0)}
                      </div>
                      <p className="text-sm text-gray-300">Issued</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-800/30 border-purple-600">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-400">
                        {books.filter(book => book.status === 'OVERDUE').length}
                      </div>
                      <p className="text-sm text-gray-300">Overdue</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  {filteredBooks.map((book) => (
                    <div key={book.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{book.title}</h3>
                        <p className="text-sm text-gray-300">by {book.author}</p>
                        <div className="flex gap-4 text-sm text-gray-400 mt-1">
                          <span>ISBN: {book.isbn}</span>
                          <span>Category: {book.category}</span>
                          <span>Available: {book.availableCopies}/{book.totalCopies}</span>
                          <span>Location: {book.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-purple-600 text-white hover:bg-purple-700"
                          onClick={() => {
                            setSelectedBook(book);
                            setIsBookDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="circulation">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="h-5 w-5" />
                  Book Circulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-300">
                  <p className="mb-4">Book issue/return interface</p>
                  <div className="space-y-4 max-w-md mx-auto">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Issue Book
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Return Book
                    </Button>
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      Renew Book
                    </Button>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      View Overdue Books
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    Library Members
                  </CardTitle>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex justify-between items-center p-4 bg-purple-800/30 rounded-lg border border-purple-600">
                      <div>
                        <h3 className="font-semibold text-white">{member.name}</h3>
                        <p className="text-sm text-gray-300">{member.email} • {member.phone}</p>
                        <div className="flex gap-4 text-sm text-gray-400 mt-1">
                          <span>Type: {member.memberType}</span>
                          <span>Member since: {new Date(member.membershipDate).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            member.status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-purple-600 text-white hover:bg-purple-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5" />
                  Library Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-600 text-center">
                    <h3 className="font-semibold text-white mb-4">Circulation Report</h3>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-600 text-center">
                    <h3 className="font-semibold text-white mb-4">Overdue Books</h3>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-600 text-center">
                    <h3 className="font-semibold text-white mb-4">Popular Books</h3>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-600 text-center">
                    <h3 className="font-semibold text-white mb-4">Member Activity</h3>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-600 text-center">
                    <h3 className="font-semibold text-white mb-4">Inventory Status</h3>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-600 text-center">
                    <h3 className="font-semibold text-white mb-4">Monthly Summary</h3>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-black border-t border-purple-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-300">
          &copy; {new Date().getFullYear()} School Management System
        </div>
      </footer>
    </div>
  );
}
