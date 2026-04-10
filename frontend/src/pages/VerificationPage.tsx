import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldX, Globe, Calendar, Zap, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const VerificationPage: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sig = searchParams.get('sig');
  
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/verify/${id}`, {
          params: { sig }
        });
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Verification failed");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [id, sig]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
               <Globe size={20} className="text-white" />
             </div>
             <h1 className="font-bold text-xl">Green-Compute</h1>
          </div>
          <a href="/" className="text-slate-500 hover:text-white flex items-center gap-2 text-sm">
             <ArrowLeft size={16} /> Dashboard
          </a>
        </header>

        {error ? (
          <div className="glass border-red-500/30 p-10 rounded-3xl text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldX size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invalid Certificate</h2>
            <p className="text-slate-400 mb-8">{error}</p>
            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-xs text-red-400 font-mono">
              The signature provided does not match our records or the task ID is incorrect.
            </div>
          </div>
        ) : (
          <div className="glass border-green-500/30 p-10 rounded-3xl">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 status-pulse-green">
                <ShieldCheck size={40} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Certified Authentic</h2>
              <p className="text-green-500/80 font-medium">Sustainable AI Execution Verified</p>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between py-4 border-b border-white/5">
                 <span className="text-slate-500 flex items-center gap-2 font-medium"><Globe size={16}/> Provider</span>
                 <span className="font-bold">Green-Compute Core v1</span>
               </div>
               <div className="flex justify-between py-4 border-b border-white/5">
                 <span className="text-slate-500 flex items-center gap-2 font-medium"><Calendar size={16}/> Executed At</span>
                 <span className="font-mono">{new Date(data.executed_at).toLocaleString()}</span>
               </div>
               <div className="flex justify-between py-4 border-b border-white/5">
                 <span className="text-slate-500 flex items-center gap-2 font-medium"><Zap size={16}/> Carbon Saved</span>
                 <span className="text-green-500 font-bold">{data.carbon_saved}</span>
               </div>
            </div>

            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Cryptographic Proof</h4>
               <div className="font-mono text-[10px] break-all text-slate-400 bg-black/40 p-4 rounded-xl border border-white/5">
                 ID: {data.task_id}
                 <br />
                 SIG: {sig}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
