import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import Header from "../pages/header";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";
import { FilterList as FilterIcon } from "@mui/icons-material";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function EditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [sabitler, setSabitler] = useState<any[]>(Array(12).fill(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const handleThemeToggle = () => setIsDarkMode((prev) => !prev);

  // Filtrelerle ilgili state'ler
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const session = await getSession();
        const token = session?.accessToken;
        if (!token) throw new Error("Token bulunamadı.");

        const resp = await axios.post(
          `https://maestro-api-dev.secil.biz/Collection/${id}/GetProductsForConstants`,
          { additionalFilters: [], page: 1, pageSize: 36 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = resp.data?.data?.data || [];
        setItems(data);
        setFilteredItems(data);

        const collectionFilters = await axios.get(
          `https://maestro-api-dev.secil.biz/Collection/${id}/GetFiltersForConstants`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const cfData = collectionFilters.data?.data || [];
        setFilters(cfData);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProducts();
  }, [id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log({ active, over });
    if (!over) return;
    if (over.id.toString().startsWith("slot-")) {
      const idx = parseInt(over.id.toString().slice(5));
      const dragged = items.find((i) => i.id === active.id);
      if (!dragged) return;
      const updated = [...sabitler];
      updated[idx] = dragged;
      setSabitler(updated);
    }
  };

  const clearFilters = () => {
    setFilteredItems(items);
  };

  return (
    <>
      <Header
        collectionIndex={1}
        totalProducts={items.length}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Sol Menü */}
        <Box sx={{ width: "20%", bgcolor: "grey.100", p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Menü
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button fullWidth>Dashboard</Button>
            <Button fullWidth>Ürünler</Button>
            <Button fullWidth variant="contained">
              Koleksiyon
            </Button>
          </Box>
        </Box>

        {/* Orta/Sağ */}
        <Box sx={{ width: "80%", p: 2 }}>
          <Box sx={{ mb: 2 }}>
            {selectedFilters?.map((item) => (
              <Chip
                label={
                  filters.find((it) => it.id === item.id).title +
                  ": " +
                  filters
                    .find((it) => it.id === item.id)
                    .values.find((v) => v.value === item.value).valueName
                }
                onDelete={() => {
                  var nsf = selectedFilters.filter((sfi) => sfi.id !== item.id);
                  setSelectedFilters(nsf);
                }}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          {/* Filtre Butonu */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              Filtrele
            </Button>
          </Box>
          {/* Filtre Paneli */}
          {showFilters && (
            <Paper
              elevation={6}
              sx={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                width: "60%",
                height: "50vh",
                zIndex: 1300,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                p: 3,
                bgcolor: "background.paper",
                overflowY: "auto",
                boxShadow: 8,
                backdropFilter: "blur(6px)",
                backgroundColor: "rgba(255,255,255,0.85)",
              }}
            >
              {/* Çıkış Butonu */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton onClick={() => setShowFilters(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Typography variant="h6" gutterBottom>
                Filtreler
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                {/* Stok Filtreleri */}
                {filters?.map((filter, index) => (
                  <FormControl
                    key={"fc-" + index}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <InputLabel>{filter.title}</InputLabel>
                    <Select
                      value={selectedFilters.filter(
                        (sf) => sf.id === filter.id
                      )}
                      onChange={(e) => {
                        setSelectedFilters((sf) => {
                          var found = false;
                          var newSf = sf.map((dd) => {
                            if (dd.id === filter.id) {
                              found = true;
                              return { id: filter.id, value: e.target.value };
                            } else {
                              return dd;
                            }
                          });
                          if (!found) {
                            newSf.push({
                              id: filter.id,
                              value: e.target.value,
                            });
                          }
                          return newSf;
                        });
                      }}
                      label={filter.title}
                    >
                      {filter?.values.map((it, iti) => (
                        <MenuItem key={"fcmi-" + iti} value={it.value}>
                          {it.valueName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>

              {/* Butonlar */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="outlined" onClick={clearFilters}>
                  Seçimi Temizle
                </Button>
                <Button variant="contained">Ara</Button>
              </Box>
            </Paper>
          )}
          {/* Drag&Drop bölümü */}
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && (
            <DndContext
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Ürünler */}
                <Box
                  sx={{
                    width: "40%",
                    maxHeight: "calc(100vh - 300px)",
                    overflowY: "auto",
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Ürünler
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: 2,
                      pr: 1,
                    }}
                  >
                    {filteredItems.map((item) => (
                      <DraggableItem key={item.id} item={item} />
                    ))}
                  </Box>
                </Box>

                {/* Sabitler */}
                <Box sx={{ width: "60%" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sabitler
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 2,
                    }}
                  >
                    {sabitler.map((s, i) => (
                      <DroppableSlot key={i} id={`slot-${i}`} item={s} />
                    ))}
                  </Box>
                </Box>
              </Box>
            </DndContext>
          )}
          {/* Kaydet / Vazgeç modal */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}
          >
            <Button variant="outlined" onClick={() => router.push("/")}>
              Vazgeç
            </Button>
            <Button variant="contained" onClick={() => setOpenModal(true)}>
              Kaydet
            </Button>
          </Box>
          <Dialog open={openModal} onClose={() => setOpenModal(false)}>
            <DialogTitle>Kaydedilecek Sıra</DialogTitle>
            <DialogContent>
              <pre>
                {JSON.stringify(
                  sabitler.map((i) => i?.id || null),
                  null,
                  2
                )}
              </pre>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(false)}>Kapat</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
}

function DraggableItem({ item }: { item: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({
      id: item.id,
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardMedia
          component="img"
          height="120"
          image={item.imageUrl}
          alt={item.name}
        />
        <CardContent>
          <Typography variant="subtitle2" noWrap>
            {item.name}
          </Typography>
          <Typography variant="caption">{item.code}</Typography>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableSlot({ id, item }: { id: string; item: any }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        variant="outlined"
        sx={{
          height: 180,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderColor: isOver ? "primary.main" : "grey.300",
          textAlign: "center",
        }}
      >
        {item ? (
          <>
            <CardMedia
              component="img"
              height="100"
              image={item.imageUrl}
              alt={item.name}
              sx={{ objectFit: "contain", mb: 1 }}
            />
            <CardContent sx={{ p: 1 }}>
              <Typography variant="caption" noWrap>
                {item.name}
              </Typography>
            </CardContent>
          </>
        ) : (
          <Typography color="text.secondary">+ Sürükle</Typography>
        )}
      </Card>
    </div>
  );
}
