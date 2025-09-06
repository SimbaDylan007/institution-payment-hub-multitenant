import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, Edit, Trash2, BookUp, BookDown, Library as LibraryIcon, UploadCloud, Download, Search, BookUser } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PaginationControls } from "@/components/PaginationControls";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the secure fetch wrapper

// --- Interfaces ---
interface Book { id: number; title: string; author: string; isbn: string; publisher: string; publishedDate: string; category: string; totalCopies: number; availableCopies: number; location: string; status: string; }
interface BookTransaction { id: number; book: { title: string }; student: { studentId: string }; issueDate: string; dueDate: string; returnDate: string | null; status: string; }
interface Page<T> { content: T[]; totalPages: number; number: number; }

export default function Library() {
  const { user } = useAuth();
  const [bookPage, setBookPage] = useState<Page<Book> | null>(null);
  const [loanPage, setLoanPage] = useState<Page<BookTransaction> | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [loanSearch, setLoanSearch] = useState("");
  const [bookPageNum, setBookPageNum] = useState(0);
  const [loanPageNum, setLoanPageNum] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'issue' | 'return'>('issue');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState("");

  const fetchBooks = useCallback((page = 0, search = "") => {
    setLoading(true);
    const url = `http://localhost:8080/api/library/books?page=${page}&size=10&sort=title,asc&searchTerm=${encodeURIComponent(search)}`;
    apiFetch(url).then(res => res.json()).then(setBookPage).catch(() => toast.error('Failed to fetch books.')).finally(() => setLoading(false));
  }, []);

  const fetchLoans = useCallback((page = 0, search = "") => {
    setLoading(true);
    const url = `http://localhost:8080/api/library/transactions?page=${page}&size=10&studentId=${encodeURIComponent(search)}`;
    apiFetch(url).then(res => res.json()).then(setLoanPage).catch(err => toast.error(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchBooks(bookPageNum, bookSearch); }, 300);
    return () => clearTimeout(timer);
  }, [bookSearch, bookPageNum, fetchBooks]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchLoans(loanPageNum, loanSearch); }, 300);
    return () => clearTimeout(timer);
  }, [loanSearch, loanPageNum, fetchLoans]);

  const handleBookSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true);
    const formData = new FormData(e.currentTarget);
    const bookData = { title: formData.get('title'), author: formData.get('author'), isbn: formData.get('isbn'), publisher: formData.get('publisher'), publishedDate: formData.get('publishedDate'), category: formData.get('category'), totalCopies: parseInt(formData.get('totalCopies') as string), location: formData.get('location') };
    const url = selectedBook ? `http://localhost:8080/api/library/books/${selectedBook.id}` : 'http://localhost:8080/api/library/books';
    const method = selectedBook ? 'PUT' : 'POST';
    try {
      const response = await apiFetch(url, { method, body: JSON.stringify(bookData) });
      if (response.ok) {
        toast.success(`Book ${selectedBook ? 'updated' : 'added'} successfully`);
        setIsFormOpen(false); setSelectedBook(null); fetchBooks(bookPageNum, bookSearch);
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); }
  };

  const handleDeleteBook = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const response = await apiFetch(`http://localhost:8080/api/library/books/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Book deleted successfully');
        fetchBooks(bookPageNum, bookSearch);
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
  };

  const handleImport = async () => {
    if (!importFile) { toast.warning("Please select a file."); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);
    try {
      const response = await apiFetch('http://localhost:8080/api/library/books/bulk-upload', { method: 'POST', body: formData });
      if (response.ok) {
        const newBooks = await response.json();
        toast.success(`${newBooks.length} books imported/updated successfully!`);
        setIsImportOpen(false); setImportFile(null); fetchBooks();
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); }
  };

  const handleDownloadTemplate = () => {
    const headers = "title,author,isbn,category,totalCopies\n";
    const example = "The Great Gatsby,F. Scott Fitzgerald,9780743273565,FICTION,5\n";
    const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "books_import_template.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !studentId) return toast.error("Book and Student ID are required.");
    setLoading(true);
    const url = `http://localhost:8080/api/library/books/${transactionType}?bookId=${selectedBook.id}&studentId=${studentId}`;
    try {
      const response = await apiFetch(url, { method: 'POST' });
      if (response.ok) {
        toast.success(`Book successfully ${transactionType === 'issue' ? 'issued' : 'returned'}!`);
        setIsTransactionOpen(false); setSelectedBook(null); setStudentId("");
        fetchBooks(bookPageNum, bookSearch);
        fetchLoans(loanPageNum, loanSearch);
      } else { throw new Error(await response.text()); }
    } catch (error) { toast.error((error as Error).message); }
    finally { setLoading(false); }
  };

  if (!user) { return <Navigate to="/" replace />; }

  return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-blue-900 text-white flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center"><h1 className="text-2xl font-bold">Library Management</h1><Button asChild><Link to="/dashboard" className="flex items-center gap-2"><Home className="h-4 w-4 mr-2"/>Dashboard</Link></Button></div>
          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-purple-900/50 border-purple-700">
              <TabsTrigger value="inventory">Book Inventory</TabsTrigger>
              <TabsTrigger value="history">Loan History</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle className="flex items-center gap-2"><LibraryIcon/>Book Inventory</CardTitle><div className="flex gap-2"><Button onClick={() => setIsImportOpen(true)} className="bg-blue-600 hover:bg-blue-700"><UploadCloud size={16} className="mr-2"/> Import Books</Button><Button className="bg-green-600 hover:bg-green-700" onClick={() => {setSelectedBook(null); setIsFormOpen(true);}}><Plus size={16} className="mr-2"/> Add Book</Button></div></div>
                  <div className="flex gap-4 pt-4"><Input placeholder="Search by title, author, or ISBN..." value={bookSearch} onChange={e => {setBookSearch(e.target.value); setBookPageNum(0);}} className="bg-purple-800 border-purple-600"/></div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-purple-700"><th className="p-2">Title</th><th className="p-2">Author</th><th className="p-2">ISBN</th><th className="p-2">Copies (Avail/Total)</th><th className="p-2 text-center">Actions</th></tr></thead><tbody>
                  {loading && !bookPage?.content ? (<tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>) :
                      bookPage?.content.map((book) => (
                          <tr key={book.id} className="border-b border-purple-800/50">
                            <td className="p-2">{book.title}</td><td className="p-2">{book.author}</td>
                            <td className="p-2">{book.isbn}</td><td className="p-2 text-center">{`${book.availableCopies} / ${book.totalCopies}`}</td>
                            <td className="p-2 flex justify-center gap-2">
                              <Button title="Issue Book" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedBook(book); setTransactionType('issue'); setIsTransactionOpen(true); }}><BookUp size={16}/></Button>
                              <Button title="Return Book" size="sm" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => { setSelectedBook(book); setTransactionType('return'); setIsTransactionOpen(true); }}><BookDown size={16}/></Button>
                              <Button title="Edit Book" size="sm" variant="outline" onClick={() => { setSelectedBook(book); setIsFormOpen(true); }}><Edit size={16}/></Button>
                              <Button title="Delete Book" size="sm" variant="destructive" onClick={() => handleDeleteBook(book.id)}><Trash2 size={16}/></Button>
                            </td>
                          </tr>
                      ))}
                  </tbody></table></div>
                  <PaginationControls page={bookPage} onPageChange={setBookPageNum}/>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookUser/>Loan History</CardTitle>
                  <div className="flex gap-2 pt-4"><Input placeholder="Filter by Student ID..." value={loanSearch} onChange={e => {setLoanSearch(e.target.value); setLoanPageNum(0);}} className="bg-purple-800 border-purple-600"/></div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-purple-700"><th className="p-2">Book Title</th><th className="p-2">Student ID</th><th className="p-2">Issue Date</th><th className="p-2">Due Date</th><th className="p-2">Return Date</th><th className="p-2">Status</th></tr></thead><tbody>
                  {loading && !loanPage?.content ? (<tr><td colSpan={6} className="text-center p-4">Loading history...</td></tr>) :
                      loanPage?.content.map(loan => (
                          <tr key={loan.id} className="border-b border-purple-800/50">
                            <td className="p-2">{loan.book.title}</td>
                            <td className="p-2">{loan.student.studentId}</td>
                            <td className="p-2">{loan.issueDate}</td>
                            <td className="p-2">{loan.dueDate}</td>
                            <td className="p-2">{loan.returnDate || 'Not Returned'}</td>
                            <td className="p-2"><Badge className={loan.status === 'ISSUED' ? 'bg-yellow-500' : 'bg-green-500'}>{loan.status}</Badge></td>
                          </tr>
                      ))}
                  </tbody></table></div>
                  <PaginationControls page={loanPage} onPageChange={setLoanPageNum}/>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}><DialogContent className="bg-gray-900 text-white border-gray-700"><DialogHeader><DialogTitle>{transactionType === 'issue' ? `Issue Book: ${selectedBook?.title}` : `Return Book: ${selectedBook?.title}`}</DialogTitle></DialogHeader><form onSubmit={handleTransactionSubmit} className="space-y-4 py-4"><div><Label htmlFor="studentId">Student ID</Label><Input id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)} required className="bg-gray-800"/></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsTransactionOpen(false)}>Cancel</Button><Button type="submit">{transactionType === 'issue' ? 'Issue Book' : 'Return Book'}</Button></div></form></DialogContent></Dialog>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedBook(null); setIsFormOpen(isOpen);}}><DialogContent className="bg-purple-900 border-purple-700 text-white max-w-2xl"><DialogHeader><DialogTitle>{selectedBook ? 'Edit Book' : 'Add New Book'}</DialogTitle></DialogHeader><form onSubmit={handleBookSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4"><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="title">Title</Label><Input id="title" name="title" defaultValue={selectedBook?.title} required className="bg-gray-800"/></div><div><Label htmlFor="author">Author</Label><Input id="author" name="author" defaultValue={selectedBook?.author} required className="bg-gray-800"/></div></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="isbn">ISBN</Label><Input id="isbn" name="isbn" defaultValue={selectedBook?.isbn} required className="bg-gray-800"/></div><div><Label htmlFor="publisher">Publisher</Label><Input id="publisher" name="publisher" defaultValue={selectedBook?.publisher} className="bg-gray-800"/></div></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="publishedDate">Published Date</Label><Input id="publishedDate" name="publishedDate" type="date" defaultValue={selectedBook?.publishedDate} className="bg-gray-800"/></div><div><Label htmlFor="category">Category</Label><Select name="category" defaultValue={selectedBook?.category}><SelectTrigger className="bg-gray-800"><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent className="bg-gray-800"><SelectItem value="FICTION">Fiction</SelectItem><SelectItem value="NON_FICTION">Non-Fiction</SelectItem><SelectItem value="SCIENCE">Science</SelectItem><SelectItem value="HISTORY">History</SelectItem></SelectContent></Select></div></div><div className="grid grid-cols-2 gap-4"><div><Label htmlFor="totalCopies">Total Copies</Label><Input id="totalCopies" name="totalCopies" type="number" defaultValue={selectedBook?.totalCopies} required className="bg-gray-800"/></div><div><Label htmlFor="location">Location</Label><Input id="location" name="location" defaultValue={selectedBook?.location} className="bg-gray-800"/></div></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div></form></DialogContent></Dialog>
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}><DialogContent className="bg-gray-900 text-white border-gray-700"><DialogHeader><DialogTitle>Bulk Import Books</DialogTitle></DialogHeader><div className="space-y-4 py-4"><p className="text-sm text-gray-400">Upload a CSV or Excel file.</p><Button variant="outline" onClick={handleDownloadTemplate} className="w-full gap-2"><Download size={16}/>Download CSV Template</Button><div><Label htmlFor="importFile">Upload File</Label><Input id="importFile" type="file" onChange={(e) => setImportFile(e.target.files?.[0] || null)} accept=".csv, .xlsx"/></div><div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button><Button onClick={handleImport} disabled={loading}>{loading ? "Importing..." : "Start Import"}</Button></div></div></DialogContent></Dialog>
      </div>
  );
}