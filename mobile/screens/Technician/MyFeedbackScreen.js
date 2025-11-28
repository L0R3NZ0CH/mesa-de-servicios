import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { feedbackService } from "../../services/api";

const MyFeedbackScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    average_rating: "0.0",
    total_feedbacks: 0,
    rating_distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getTechnicianFeedback(user.id);

      if (response.success) {
        setFeedbacks(response.data.feedbacks || []);
        calculateStats(response.data.feedbacks || []);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedback();
    setRefreshing(false);
  };

  const calculateStats = (feedbackList) => {
    if (feedbackList.length === 0) {
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    feedbackList.forEach((feedback) => {
      const rating = feedback.rating;
      distribution[rating]++;
      totalRating += rating;
    });

    setStats({
      average_rating: (totalRating / feedbackList.length).toFixed(1),
      total_feedbacks: feedbackList.length,
      rating_distribution: distribution,
    });
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#4CAF50";
    if (rating >= 3.5) return "#8BC34A";
    if (rating >= 2.5) return "#FF9800";
    return "#F44336";
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Estadísticas Generales */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Mi Rendimiento</Text>

        <View style={styles.averageRatingContainer}>
          <Text
            style={[
              styles.averageRating,
              { color: getRatingColor(parseFloat(stats.average_rating)) },
            ]}
          >
            {stats.average_rating}
          </Text>
          <Text style={styles.starsLarge}>
            {renderStars(Math.round(parseFloat(stats.average_rating)))}
          </Text>
          <Text style={styles.totalFeedbacks}>
            {stats.total_feedbacks} evaluaciones
          </Text>
        </View>

        <View style={styles.distributionContainer}>
          <Text style={styles.distributionTitle}>Distribución</Text>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.rating_distribution[rating];
            const percentage =
              stats.total_feedbacks > 0
                ? ((count / stats.total_feedbacks) * 100).toFixed(0)
                : 0;

            return (
              <View key={rating} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{rating} ⭐</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${percentage}%` },
                      { backgroundColor: getRatingColor(rating) },
                    ]}
                  />
                </View>
                <Text style={styles.distributionCount}>
                  {count} ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Lista de Feedbacks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comentarios Recibidos</Text>

        {feedbacks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aún no has recibido evaluaciones
            </Text>
          </View>
        ) : (
          feedbacks.map((feedback) => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.stars}>{renderStars(feedback.rating)}</Text>
                <Text style={styles.date}>
                  {new Date(feedback.created_at).toLocaleDateString("es-ES")}
                </Text>
              </View>

              {feedback.comment && (
                <Text style={styles.comment}>"{feedback.comment}"</Text>
              )}

              <View style={styles.ticketInfo}>
                <Text style={styles.ticketLabel}>Ticket:</Text>
                <Text style={styles.ticketTitle}>{feedback.ticket_title}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  averageRatingContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "bold",
  },
  starsLarge: {
    fontSize: 24,
    marginVertical: 5,
  },
  totalFeedbacks: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  distributionContainer: {
    marginTop: 10,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  distributionLabel: {
    width: 50,
    fontSize: 14,
    color: "#666",
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  distributionCount: {
    width: 80,
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  emptyContainer: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  feedbackCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  stars: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  comment: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
    marginBottom: 10,
    lineHeight: 20,
  },
  ticketInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  ticketLabel: {
    fontSize: 12,
    color: "#999",
    marginRight: 5,
  },
  ticketTitle: {
    fontSize: 12,
    color: "#2196F3",
    flex: 1,
  },
});

export default MyFeedbackScreen;
