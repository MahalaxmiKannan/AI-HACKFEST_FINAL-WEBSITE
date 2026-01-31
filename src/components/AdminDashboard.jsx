import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdminDashboard.css';

function AdminDashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRegistrations();
    }, []);

    useEffect(() => {
        filterRegistrations();
    }, [searchTerm, registrations]);

    const fetchRegistrations = async () => {
        try {
            const q = query(collection(db, 'registrations'), orderBy('submittedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
            }));
            setRegistrations(data);
            setFilteredRegistrations(data);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRegistrations = () => {
        if (!searchTerm) {
            setFilteredRegistrations(registrations);
            return;
        }
        const term = searchTerm.toLowerCase();
        const filtered = registrations.filter(reg =>
            reg.name?.toLowerCase().includes(term) ||
            reg.email?.toLowerCase().includes(term) ||
            reg.teamName?.toLowerCase().includes(term) ||
            reg.upiTransactionId?.toLowerCase().includes(term) ||
            reg.selectedProblem?.toLowerCase().includes(term)
        );
        setFilteredRegistrations(filtered);
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/admin');
    };

    // Export all registrations to Excel
    const exportAllToExcel = () => {
        const data = filteredRegistrations.map(reg => ({
            'Team Name': reg.teamName,
            'Leader Name': reg.name,
            'Email': reg.email,
            'Phone': reg.phone,
            'Team Size': reg.teamSize,
            'Team Members': reg.teamMembers?.map(m => `${m.name} (${m.email})`).join('; '),
            'Problem Statement': reg.selectedProblem,
            'Transaction ID': reg.upiTransactionId,
            'Submitted At': reg.submittedAt?.toLocaleDateString?.() || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
        XLSX.writeFile(wb, 'hackathon_registrations.xlsx');
    };

    // Export all registrations to PDF
    const exportAllToPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(18);
        doc.text('Hackathon Registrations', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

        const tableData = filteredRegistrations.map(reg => [
            reg.teamName,
            reg.name,
            reg.email,
            reg.phone,
            reg.selectedProblem?.substring(0, 30) + '...',
            reg.upiTransactionId,
            reg.submittedAt?.toLocaleDateString?.() || 'N/A'
        ]);

        doc.autoTable({
            head: [['Team', 'Leader', 'Email', 'Phone', 'Problem', 'Transaction ID', 'Date']],
            body: tableData,
            startY: 35,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [233, 69, 96] }
        });

        doc.save('hackathon_registrations.pdf');
    };

    // Export transaction IDs to Excel
    const exportTransactionsToExcel = () => {
        const data = filteredRegistrations.map(reg => ({
            'Team Name': reg.teamName,
            'Leader Name': reg.name,
            'Transaction ID': reg.upiTransactionId,
            'Submitted At': reg.submittedAt?.toLocaleDateString?.() || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, 'transaction_ids.xlsx');
    };

    // Export transaction IDs to PDF
    const exportTransactionsToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Transaction IDs Report', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Total Transactions: ${filteredRegistrations.length}`, 14, 38);

        const tableData = filteredRegistrations.map(reg => [
            reg.teamName,
            reg.name,
            reg.upiTransactionId,
            reg.submittedAt?.toLocaleDateString?.() || 'N/A'
        ]);

        doc.autoTable({
            head: [['Team Name', 'Leader', 'Transaction ID', 'Date']],
            body: tableData,
            startY: 45,
            headStyles: { fillColor: [233, 69, 96] }
        });

        doc.save('transaction_ids.pdf');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">⌛</div>
                <p>Loading registrations...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>🎯 Admin Dashboard</h1>
                    <span className="registration-count">{filteredRegistrations.length} Registrations</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                    🚪 Logout
                </button>
            </header>

            <div className="dashboard-controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, email, team, or transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="export-buttons">
                    <div className="export-group">
                        <span className="export-label">All Data:</span>
                        <button onClick={exportAllToExcel} className="btn-export excel">
                            📊 Excel
                        </button>
                        <button onClick={exportAllToPDF} className="btn-export pdf">
                            📄 PDF
                        </button>
                    </div>
                    <div className="export-group">
                        <span className="export-label">Transactions:</span>
                        <button onClick={exportTransactionsToExcel} className="btn-export excel">
                            📊 Excel
                        </button>
                        <button onClick={exportTransactionsToPDF} className="btn-export pdf">
                            📄 PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="registrations-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Team Name</th>
                            <th>Leader</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Team Size</th>
                            <th>Problem Statement</th>
                            <th>Transaction ID</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegistrations.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    No registrations found
                                </td>
                            </tr>
                        ) : (
                            filteredRegistrations.map((reg, index) => (
                                <tr key={reg.id}>
                                    <td>{index + 1}</td>
                                    <td className="team-name">{reg.teamName}</td>
                                    <td>{reg.name}</td>
                                    <td>{reg.email}</td>
                                    <td>{reg.phone}</td>
                                    <td className="center">{reg.teamSize}</td>
                                    <td className="problem" title={reg.selectedProblem}>
                                        {reg.selectedProblem?.substring(0, 40)}...
                                    </td>
                                    <td className="transaction">{reg.upiTransactionId}</td>
                                    <td>{reg.submittedAt?.toLocaleDateString?.() || 'N/A'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
