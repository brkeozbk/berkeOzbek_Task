import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import axios from "axios";

type Filter = {
  id: string;
  title: string;
  value: string;
  valueName: string;
  currency: string | null;
  comparisonType: number;
};

type CollectionItem = {
  id: number;
  filters: {
    useOrLogic: boolean;
    filters: Filter[];
  };
};

type Props = {
  username: string;
};

export default function CollectionsPage({ username }: Props) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCollections() {
      try {
        const session = await getSession();
        const token = session?.accessToken;

        if (!token) {
          setError("Token bulunamadı.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://maestro-api-dev.secil.biz/Collection/GetAll",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setItems(data?.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Hoş geldin, {username}
      </Typography>

      {loading && (
        <Typography>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          Yükleniyor...
        </Typography>
      )}
      {error && <Alert severity="error">Hata: {error}</Alert>}

      {!loading && !error && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Koleksiyon Listesi
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Ürün Koşulları (Renk)</TableCell>
                <TableCell>Satış Kanalı</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{`Koleksiyon ${item.id}`}</TableCell>
                  <TableCell>
                    {item.filters?.filters
                      ?.filter((f) => f.id === "color")
                      .map((f) => f.valueName)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    {item.filters?.filters
                      ?.filter((f) => f.id === "salesChannel")
                      .map((f) => f.valueName)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      onClick={() => router.push(`/edit?id=${item.id}`)}
                    >
                      Sabitleri Düzenle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const username = session.user?.name || session.user?.username || "";

  return {
    props: {
      username,
    },
  };
};