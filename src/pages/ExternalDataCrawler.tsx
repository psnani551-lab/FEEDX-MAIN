import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, RefreshCw, Loader } from 'lucide-react';

interface CrawledData {
  announcements?: any[];
  opportunities?: any[];
  events?: any[];
  [key: string]: any;
}

const ExternalDataCrawler = () => {
  const [gioData, setGioData] = useState<CrawledData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('announcements');
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
    }
  }, [token]);

  const fetchCrawledData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crawler/gioe', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setGioData(data);
      setActiveTab('announcements');

      toast({
        title: 'Success',
        description: 'Data crawled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to crawl data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['announcements', 'opportunities', 'events'];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">External Data Crawler</h1>
          <p className="text-gray-400">Fetch and display data from external websites</p>
        </div>

        {/* Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-purple-500/30 bg-slate-800/50 cursor-pointer hover:border-purple-500 transition">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">GIOE.netlify.app</h3>
              <p className="text-gray-400 text-sm mb-4">Fetch announcements, opportunities, and events</p>
              <Button
                onClick={fetchCrawledData}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Crawling...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-slate-800/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Data Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Last fetched:</span>
                  <span className="text-gray-300">
                    {gioData?.fetched_at ? new Date(gioData.fetched_at).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sections:</span>
                  <span className="text-gray-300">{gioData ? Object.keys(gioData.sections || {}).length : 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Display */}
        {gioData && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-700">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition capitalize border-b-2 ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab} ({(gioData.sections?.[tab] || []).length})
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
              {(gioData.sections?.[activeTab] || []).map((item: any, index: number) => (
                <Card key={index} className="border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {Object.entries(item).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-purple-400 uppercase">{key}</span>
                          <span className="text-gray-300">
                            {typeof value === 'string' && value.startsWith('http')
                              ? (
                                  <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                                  >
                                    {value.substring(0, 50)}...
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(gioData.sections?.[activeTab] || []).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No {activeTab} found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!gioData && !loading && (
          <Card className="border-slate-700 bg-slate-800/30">
            <CardContent className="p-12 text-center">
              <ExternalLink className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Data Loaded</h3>
              <p className="text-gray-400 mb-6">Click "Fetch Data" to crawl external websites</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExternalDataCrawler;
