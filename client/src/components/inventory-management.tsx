import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingDown, 
  Plus,
  Minus,
  Edit,
  Trash2,
  Search,
  Filter,
  DollarSign,
  BarChart3,
  Calendar,
  Eye,
  Archive,
  RefreshCw,
  Download
} from "lucide-react";
import type { Inventory, InventoryUsage, RetailSale } from "@shared/schema";

export function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "low_stock" | "out_of_stock" | "retail">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inventory items
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/inventory");
      return response.json();
    },
  });

  // Fetch inventory usage
  const { data: usage = [] } = useQuery({
    queryKey: ["/api/inventory-usage"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/inventory-usage");
      return response.json();
    },
  });

  // Fetch retail sales
  const { data: sales = [] } = useQuery({
    queryKey: ["/api/retail-sales"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/retail-sales");
      return response.json();
    },
  });

  // Add inventory item mutation
  const addItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await apiRequest("POST", "/api/inventory", itemData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowAddItemDialog(false);
      toast({
        title: "Item Added",
        description: "Inventory item has been successfully added.",
      });
    },
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ id, adjustment, reason }: { id: number; adjustment: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/inventory/${id}/adjust`, { adjustment, reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Stock Updated",
        description: "Inventory levels have been adjusted.",
      });
    },
  });

  // Record retail sale mutation
  const recordSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await apiRequest("POST", "/api/retail-sales", saleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retail-sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowSaleDialog(false);
      toast({
        title: "Sale Recorded",
        description: "Retail sale has been recorded and inventory updated.",
      });
    },
  });

  // Filter inventory items
  const filteredInventory = inventory.filter((item: Inventory) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    const currentStock = item.currentStock || 0;
    const minimumStock = item.minimumStock || 0;
    
    switch (filterBy) {
      case "low_stock":
        return currentStock <= minimumStock && currentStock > 0;
      case "out_of_stock":
        return currentStock === 0;
      case "retail":
        return item.isRetailItem;
      default:
        return true;
    }
  });

  // Get low stock alerts
  const getLowStockAlerts = () => {
    return inventory.filter((item: Inventory) => {
      const currentStock = item.currentStock || 0;
      const minimumStock = item.minimumStock || 0;
      return currentStock <= minimumStock;
    });
  };

  // Calculate inventory value
  const getInventoryValue = () => {
    return inventory.reduce((total: number, item: Inventory) => {
      const stock = item.currentStock || 0;
      const cost = item.costPrice || 0;
      return total + (stock * cost);
    }, 0);
  };

  // Get top selling items
  const getTopSellingItems = () => {
    const salesByItem = sales.reduce((acc: any, sale: RetailSale) => {
      acc[sale.inventoryId] = (acc[sale.inventoryId] || 0) + sale.quantity;
      return acc;
    }, {});

    return Object.entries(salesByItem)
      .map(([itemId, quantity]) => ({
        item: inventory.find((i: Inventory) => i.id === parseInt(itemId)),
        quantity: quantity as number
      }))
      .filter(({ item }) => item)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  // Calculate monthly sales data
  const getMonthlySalesData = () => {
    const now = new Date();
    const thisMonth = sales.filter((sale: RetailSale) => {
      const saleDate = new Date(sale.saleDate);
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });

    const totalSales = thisMonth.reduce((sum: number, sale: RetailSale) => sum + sale.totalPrice, 0);
    const totalItems = thisMonth.reduce((sum: number, sale: RetailSale) => sum + sale.quantity, 0);

    return { totalSales, totalItems, salesCount: thisMonth.length };
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const lowStockAlerts = getLowStockAlerts();
  const inventoryValue = getInventoryValue();
  const topSellingItems = getTopSellingItems();
  const monthlySales = getMonthlySalesData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Track products, manage stock levels, and monitor sales</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <AddItemForm 
                onSubmit={addItemMutation.mutate}
                isLoading={addItemMutation.isPending}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
            <DialogTrigger asChild>
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Retail Sale</DialogTitle>
              </DialogHeader>
              <SaleForm 
                inventory={inventory.filter((item: Inventory) => item.isRetailItem)}
                onSubmit={recordSaleMutation.mutate}
                isLoading={recordSaleMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {lowStockAlerts.length} item(s) need restocking
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStockAlerts.slice(0, 3).map((item: Inventory) => (
                <Badge key={item.id} className="bg-orange-100 text-orange-800">
                  {item.name} ({item.currentStock || 0} left)
                </Badge>
              ))}
              {lowStockAlerts.length > 3 && (
                <Badge className="bg-orange-100 text-orange-800">
                  +{lowStockAlerts.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales">Retail Sales</TabsTrigger>
          <TabsTrigger value="usage">Usage Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="retail">Retail Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {inventory.length}
                </div>
                <p className="text-sm text-gray-600">Total Items</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(inventoryValue)}
                </div>
                <p className="text-sm text-gray-600">Inventory Value</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {lowStockAlerts.length}
                </div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {inventory.filter((item: Inventory) => item.isRetailItem).length}
                </div>
                <p className="text-sm text-gray-600">Retail Items</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No inventory items found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInventory.map((item: Inventory) => {
                    const currentStock = item.currentStock || 0;
                    const minimumStock = item.minimumStock || 0;
                    const isLowStock = currentStock <= minimumStock;
                    const isOutOfStock = currentStock === 0;
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-teal-300 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.brand && (
                              <Badge variant="outline">{item.brand}</Badge>
                            )}
                            {item.isRetailItem && (
                              <Badge className="bg-purple-100 text-purple-800">Retail</Badge>
                            )}
                            {isOutOfStock && (
                              <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                            )}
                            {isLowStock && !isOutOfStock && (
                              <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Stock: </span>
                              <span className={isLowStock ? 'text-red-600' : ''}>{currentStock}</span>
                            </div>
                            <div>
                              <span className="font-medium">Min: </span>
                              {minimumStock}
                            </div>
                            <div>
                              <span className="font-medium">Cost: </span>
                              {formatCurrency(item.costPrice || 0)}
                            </div>
                            {item.retailPrice && (
                              <div>
                                <span className="font-medium">Retail: </span>
                                {formatCurrency(item.retailPrice)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StockAdjustment 
                            item={item}
                            onAdjust={(adjustment, reason) => 
                              updateStockMutation.mutate({ id: item.id, adjustment, reason })
                            }
                            isLoading={updateStockMutation.isPending}
                          />
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(monthlySales.totalSales)}
                </div>
                <p className="text-sm text-gray-600">This Month Sales</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {monthlySales.totalItems}
                </div>
                <p className="text-sm text-gray-600">Items Sold</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {monthlySales.salesCount}
                </div>
                <p className="text-sm text-gray-600">Transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sales recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sales.slice(0, 10).map((sale: RetailSale) => {
                    const item = inventory.find((i: Inventory) => i.id === sale.inventoryId);
                    
                    return (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item?.name || 'Unknown Item'}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(sale.saleDate).toLocaleDateString()} • Qty: {sale.quantity}
                          </p>
                          {sale.notes && (
                            <p className="text-sm text-gray-500">{sale.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {formatCurrency(sale.totalPrice)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(sale.totalPrice / sale.quantity)} each
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Product Usage Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usage.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No usage data recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usage.slice(0, 10).map((use: InventoryUsage) => {
                    const item = inventory.find((i: Inventory) => i.id === use.inventoryId);
                    
                    return (
                      <div key={use.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item?.name || 'Unknown Item'}</h4>
                          <p className="text-sm text-gray-600">
                            Used on {new Date(use.usedAt).toLocaleDateString()}
                          </p>
                          {use.notes && (
                            <p className="text-sm text-gray-500">{use.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            -{use.quantityUsed}
                          </div>
                          <div className="text-sm text-gray-500">units</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topSellingItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sales data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topSellingItems.map(({ item, quantity }, index) => (
                    <div key={item?.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{item?.name}</h4>
                          <p className="text-sm text-gray-600">{item?.brand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">
                          {quantity} sold
                        </div>
                        {item?.retailPrice && (
                          <div className="text-sm text-gray-500">
                            {formatCurrency(quantity * item.retailPrice)} revenue
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">Well Stocked</span>
                    <span className="font-bold text-green-600">
                      {inventory.filter((item: Inventory) => 
                        (item.currentStock || 0) > (item.minimumStock || 0)
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Low Stock</span>
                    <span className="font-bold text-orange-600">
                      {inventory.filter((item: Inventory) => {
                        const current = item.currentStock || 0;
                        const minimum = item.minimumStock || 0;
                        return current <= minimum && current > 0;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm font-medium">Out of Stock</span>
                    <span className="font-bold text-red-600">
                      {inventory.filter((item: Inventory) => (item.currentStock || 0) === 0).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Turnover analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Item Form Component
function AddItemForm({ onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    currentStock: "",
    minimumStock: "",
    costPrice: "",
    retailPrice: "",
    isRetailItem: false,
    supplier: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      currentStock: parseInt(formData.currentStock) || 0,
      minimumStock: parseInt(formData.minimumStock) || 0,
      costPrice: Math.round(parseFloat(formData.costPrice) * 100) || 0, // Convert to cents
      retailPrice: formData.retailPrice ? Math.round(parseFloat(formData.retailPrice) * 100) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentStock">Current Stock *</Label>
          <Input
            id="currentStock"
            type="number"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
            required
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="minimumStock">Minimum Stock *</Label>
          <Input
            id="minimumStock"
            type="number"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
            required
            min="0"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="costPrice">Cost Price *</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            required
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="retailPrice">Retail Price</Label>
          <Input
            id="retailPrice"
            type="number"
            step="0.01"
            value={formData.retailPrice}
            onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
            min="0"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRetailItem"
          checked={formData.isRetailItem}
          onChange={(e) => setFormData({ ...formData, isRetailItem: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isRetailItem">Available for retail sale</Label>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding Item..." : "Add Item"}
      </Button>
    </form>
  );
}

// Stock Adjustment Component
function StockAdjustment({ item, onAdjust, isLoading }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [adjustment, setAdjustment] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adjustmentNum = parseInt(adjustment);
    if (adjustmentNum !== 0) {
      onAdjust(adjustmentNum, reason);
      setShowDialog(false);
      setAdjustment("");
      setReason("");
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {item.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Current Stock: {item.currentStock || 0}</Label>
          </div>
          <div>
            <Label htmlFor="adjustment">Adjustment *</Label>
            <Input
              id="adjustment"
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              placeholder="Enter + or - amount"
              required
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restock">Restock</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="used">Used in service</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="correction">Inventory correction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading || !adjustment || !reason} className="w-full">
            {isLoading ? "Adjusting..." : "Adjust Stock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Sale Form Component
function SaleForm({ inventory, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    inventoryId: "",
    quantity: "",
    salePrice: "",
    customerName: "",
    notes: "",
  });

  const selectedItem = inventory.find((item: Inventory) => item.id.toString() === formData.inventoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(formData.quantity);
    const salePrice = Math.round(parseFloat(formData.salePrice) * 100); // Convert to cents
    
    onSubmit({
      ...formData,
      inventoryId: parseInt(formData.inventoryId),
      quantity,
      unitPrice: Math.round(salePrice / quantity),
      totalPrice: salePrice,
      saleDate: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="inventoryId">Item *</Label>
        <Select value={formData.inventoryId} onValueChange={(value) => {
          const item = inventory.find((i: Inventory) => i.id.toString() === value);
          setFormData({ 
            ...formData, 
            inventoryId: value,
            salePrice: item ? (item.retailPrice / 100).toString() : ""
          });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent>
            {inventory.map((item: Inventory) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name} - {selectedItem?.retailPrice ? `$${(selectedItem.retailPrice / 100).toFixed(2)}` : 'No price set'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            min="1"
            max={selectedItem?.currentStock || 999}
          />
          {selectedItem && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedItem.currentStock} available
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="salePrice">Total Price *</Label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
            required
            min="0"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the sale"
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Recording Sale..." : "Record Sale"}
      </Button>
    </form>
  );
}