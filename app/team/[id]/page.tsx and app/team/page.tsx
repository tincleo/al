import { UpdateBalanceModal } from "@/app/components/UpdateBalanceModal";

const handleConfirmBalanceUpdate = async () => {
  if (!member) return; // or !selectedMember for team/page.tsx

  setIsBalanceUpdateLoading(true);

  try {
    const changeAmount = parseFloat(balanceChange);

    if (isNaN(changeAmount) || changeAmount <= 0) {
      setBalanceError("Please enter a valid positive number");

      return;
    }

    if (!balanceReason) {
      setBalanceError("Please select a reason");

      return;
    }

    const finalChangeAmount =
      balanceReason === "Deduction" ? -changeAmount : changeAmount;

    const previousBalance = member.current_balance; // or selectedMember.current_balance
    const newBalance = Math.round(previousBalance + finalChangeAmount);

    // Update total_earned for Daily salary and Bonus
    let newTotalEarned = member.total_earned; // or selectedMember.total_earned

    if (balanceReason === "Daily salary" || balanceReason === "Bonus") {
      newTotalEarned += changeAmount;
    }

    // Combine both update and insert operations into a single transaction
    const { data, error } = await supabase.rpc("update_balance_and_history", {
      p_member_id: member.id, // or selectedMember.id
      p_new_balance: newBalance,
      p_new_total_earned: newTotalEarned,
      p_amount: finalChangeAmount,
      p_reason: balanceReason,
      p_previous_balance: previousBalance,
      p_notes: balanceNote || null,
    });

    if (error) {
      throw error;
    }

    setMember({
      ...member,
      current_balance: newBalance,
      total_earned: newTotalEarned,
    });
    // or for team/page.tsx:
    // setTeamMembers(teamMembers.map(m => m.id === selectedMember.id ? { ...m, current_balance: newBalance, total_earned: newTotalEarned } : m));

    setIsBalanceModalOpen(false);
    setBalanceError("");
    setBalanceReason("");
    setBalanceNote("");
    toast.success(
      `Balance ${finalChangeAmount > 0 ? "increased" : "decreased"} by ${Math.abs(finalChangeAmount).toLocaleString()} FCFA successfully!`,
    );

    // Only for team/[id]/page.tsx:
    fetchBalanceHistory();
  } catch (error) {
    console.error("Error updating balance:", error);
    toast.error("Failed to update balance. Please try again.");
  } finally {
    setIsBalanceUpdateLoading(false);
  }
};

// Move the useState hook inside the component function
const [isClearingBalance, setIsClearingBalance] = useState(false);

// Update the handleClearBalance function
const handleClearBalance = async () => {
  if (!member || member.current_balance === 0 || isClearingBalance) return; // Use selectedMember for team/page.tsx

  setIsClearingBalance(true);

  try {
    const previousBalance = member.current_balance; // Use selectedMember for team/page.tsx
    const changeAmount = -previousBalance;

    const { error: updateError } = await supabase
      .from("team")
      .update({
        current_balance: 0,
        total_earned: member.total_earned + previousBalance,
      })
      .eq("id", memberId); // Use selectedMember.id for team/page.tsx

    if (updateError) {
      throw updateError;
    }

    const { error: historyError } = await supabase
      .from("balance_history")
      .insert({
        team_member_id: memberId, // Use selectedMember.id for team/page.tsx
        amount: changeAmount,
        type: "decrease",
        reason: "Balance cleared",
        previous_balance: previousBalance,
        new_balance: 0,
      });

    if (historyError) {
      throw historyError;
    }

    setMember({
      ...member,
      current_balance: 0,
      total_earned: member.total_earned + previousBalance,
    });
    // For team/page.tsx:
    // setTeamMembers(teamMembers.map(m => m.id === selectedMember.id ? { ...m, current_balance: 0, total_earned: m.total_earned + previousBalance } : m));

    setIsBalanceModalOpen(false);
    toast.success(
      `Balance cleared successfully. ${previousBalance.toLocaleString()} FCFA paid out.`,
    );

    // Only for team/[id]/page.tsx:
    fetchBalanceHistory();
  } catch (error) {
    console.error("Error clearing balance:", error);
    toast.error("Failed to clear balance. Please try again.");
  } finally {
    setIsClearingBalance(false);
  }
};

// In the JSX, update the UpdateBalanceModal component
<UpdateBalanceModal
  // ... other props
  isClearingBalance={isClearingBalance}
  isLoading={isBalanceUpdateLoading}
/>;
