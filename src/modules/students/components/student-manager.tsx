"use client";

import { type FormEvent, useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { formatCurrency } from "@/lib/currency";
import {
    studentTypeLabels,
    studentTypesSchema,
    type StudentDto,
    type StudentType,
} from "../schemas/student.schema";

type TagDto = { id: string; name: string };

type StudentManagerProps = {
    initialStudents: StudentDto[];
    initialTags?: TagDto[];
};

type NoticeState = {
    message: string;
    severity: "success" | "error";
} | null;

type StudentFormState = {
    name: string;
    grade: string;
    type: StudentType;
    balance: string;
    restrictionTagIds: string[];
    guardianWhatsapp: string;
};

const emptyForm: StudentFormState = {
    name: "",
    grade: "3°",
    type: "prepaid",
    balance: "0",
    restrictionTagIds: [],
    guardianWhatsapp: "",
};

function sortStudents(students: StudentDto[]) {
    return [...students].sort((a, b) => {
        if (a.isActive !== b.isActive) {
            return Number(b.isActive) - Number(a.isActive);
        }
        return a.name.localeCompare(b.name, "es");
    });
}

function getApiError(data: unknown) {
    if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
    ) {
        return data.error;
    }
    return "No se pudo completar la operacion.";
}

function getTypeColor(type: StudentType) {
    if (type === "weekly") return { bgcolor: "#d8ecfb", color: "#0065a8" };
    if (type === "monthly") return { bgcolor: "#eadcf5", color: "#7b2cbf" };
    if (type === "biweekly") return { bgcolor: "#fff0d8", color: "#a75400" };
    return { bgcolor: "#d7f4e4", color: "#008c49" };
}

export function StudentManager({ initialStudents, initialTags = [] }: StudentManagerProps) {
    const [students, setStudents] = useState(() => sortStudents(initialStudents));
    const [tags, setTags] = useState<TagDto[]>(initialTags);
    const [form, setForm] = useState<StudentFormState>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [gradeFilter, setGradeFilter] = useState("Todos");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [notice, setNotice] = useState<NoticeState>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentPendingDelete, setStudentPendingDelete] = useState<StudentDto | null>(null);
    const [deletingStudent, setDeletingStudent] = useState(false);

    // Refrescar etiquetas cada vez que se abre el modal
    useEffect(() => {
        if (!isModalOpen) return;
        fetch("/api/tags")
            .then((res) => res.json())
            .then((data: TagDto[]) => setTags(data))
            .catch(() => {});
    }, [isModalOpen]);

    const generateGradeFilters = () => {
        const uniqueGrades = [...new Set(students.map((s) => s.grade))];
        return ["Todos", ...uniqueGrades.sort((a, b) => a.localeCompare(b, "es"))];
    };

    const availableGradeFilters = generateGradeFilters();

    const filteredStudents = students.filter((student) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
            !normalizedQuery ||
            student.name.toLowerCase().includes(normalizedQuery) ||
            student.grade.toLowerCase().includes(normalizedQuery);
        const matchesGrade = gradeFilter === "Todos" || student.grade === gradeFilter;
        return matchesQuery && matchesGrade;
    });

    const editingStudent = editingId
        ? students.find((s) => s.id === editingId)
        : null;

    const updateForm = <Field extends keyof StudentFormState>(
        field: Field,
        value: StudentFormState[Field]
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const toggleTag = (tagId: string, checked: boolean) => {
        const next = checked
            ? [...form.restrictionTagIds, tagId]
            : form.restrictionTagIds.filter((id) => id !== tagId);
        updateForm("restrictionTagIds", next);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setFormError("");
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const startEditing = (student: StudentDto) => {
        setEditingId(student.id);
        setForm({
            name: student.name,
            grade: student.grade,
            type: student.type,
            balance: String(student.balance),
            restrictionTagIds: student.restrictions.map((r) => r.id),
            guardianWhatsapp: student.guardianWhatsapp ?? "",
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const showNotice = (message: string, severity: "success" | "error" = "success") => {
        setNotice({ message, severity });
    };

    const upsertStudent = (student: StudentDto) => {
        setStudents((current) => {
            const exists = current.some((item) => item.id === student.id);
            const next = exists
                ? current.map((item) => (item.id === student.id ? student : item))
                : [student, ...current];
            return sortStudents(next);
        });
    };

    const removeStudentFromState = (studentId: string) => {
        setStudents((current) => current.filter((item) => item.id !== studentId));
    };

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setFormError("");

        const isEditing = Boolean(editingId);

        try {
            const payload = {
                name: form.name,
                grade: form.grade,
                type: form.type,
                balance: form.balance,
                restrictionTagIds: form.restrictionTagIds,
                guardianWhatsapp: form.guardianWhatsapp,
            };

            const response = await fetch(
                editingId ? `/api/students/${editingId}` : "/api/students",
                {
                    method: editingId ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                setFormError(getApiError(data));
                return;
            }

            upsertStudent(data.student);
            closeModal();
            showNotice(
                isEditing
                    ? "Estudiante actualizado correctamente."
                    : "Estudiante creado correctamente.",
                "success"
            );
        } catch {
            setFormError("No se pudo conectar con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const requestDeleteStudent = (student: StudentDto) => {
        setStudentPendingDelete(student);
    };

    const closeDeleteDialog = () => {
        if (deletingStudent) return;
        setStudentPendingDelete(null);
    };

    const deleteStudent = async () => {
        const student = studentPendingDelete;
        if (!student) return;

        setDeletingStudent(true);

        try {
            const response = await fetch(`/api/students/${student.id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok) {
                showNotice(getApiError(data), "error");
                return;
            }

            removeStudentFromState(student.id);
            showNotice("Estudiante eliminado correctamente.", "error");
            setStudentPendingDelete(null);
        } catch {
            showNotice("No se pudo eliminar el estudiante.", "error");
        } finally {
            setDeletingStudent(false);
        }
    };

    const sendWhatsApp = (student: StudentDto) => {
        if (!student.guardianWhatsapp) return;
        const isPrepaid = student.type === "prepaid";
        const lines = [
            `Hola, le informamos sobre el estado de la cuenta de *${student.name}* (${student.grade}) en la tienda escolar.`,
            "",
            isPrepaid
                ? student.balance < 0
                    ? `*Saldo en contra (deuda):* ${formatCurrency(Math.abs(student.balance))}`
                    : `*Saldo disponible:* ${formatCurrency(student.balance)}`
                : `*Modalidad:* ${studentTypeLabels[student.type]}`,
            "",
            "Para más información, comuníquese con la administración del colegio.",
        ];
        const text = encodeURIComponent(lines.join("\n"));
        window.open(`https://wa.me/${student.guardianWhatsapp}?text=${text}`, "_blank");
    };

    return (
        <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <BadgeOutlinedIcon sx={{ fontSize: 24, color: "#0a2540" }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0a2540" }}>
                    Estudiantes
                </Typography>
            </Stack>

            <Paper elevation={0} sx={{ p: 3 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    sx={{ alignItems: { md: "center" } }}
                >
                    <TextField
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Nombre o apellido..."
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="primary" fontSize="small" />
                                    </InputAdornment>
                                ),
                                sx: { fontSize: 13 },
                            },
                        }}
                    />
                    <Button
                        type="button"
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={openCreateModal}
                        sx={{ minWidth: 160, whiteSpace: "nowrap", fontSize: 13, fontWeight: 800, py: 1 }}
                    >
                        Crear estudiante
                    </Button>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: "wrap", mt: 2 }}
                >
                    {availableGradeFilters.map((grade) => (
                        <Chip
                            key={grade}
                            label={grade}
                            clickable
                            onClick={() => setGradeFilter(grade)}
                            color={gradeFilter === grade ? "primary" : "default"}
                            variant={gradeFilter === grade ? "filled" : "outlined"}
                            sx={{ fontWeight: 900, px: 0.75 }}
                        />
                    ))}
                </Stack>
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={{ p: { xs: 1, sm: 3 }, overflowX: "auto" }}>
                <Table sx={{ minWidth: 700, "& .MuiTableCell-root": { fontSize: 14 } }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell sx={{ fontWeight: 900, color: "#64748b" }}>Nombre</TableCell>
                            <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, fontWeight: 900, color: "#64748b" }}>Grado</TableCell>
                            <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, fontWeight: 900, color: "#64748b" }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 900, color: "#64748b" }}>Saldo/Estado</TableCell>
                            <TableCell sx={{ display: { xs: "none", md: "table-cell" }, fontWeight: 900, color: "#64748b" }}>Restricciones</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, color: "#64748b" }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    sx={{ color: "text.secondary", py: 5, textAlign: "center" }}
                                >
                                    No hay estudiantes para mostrar.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => {
                                const typeColor = getTypeColor(student.type);
                                const isPrepaid = student.type === "prepaid";
                                const inDebt = isPrepaid && student.balance < 0;
                                const lowBalance = isPrepaid && !inDebt && student.balance <= 5000;

                                return (
                                    <TableRow
                                        key={student.id}
                                        hover
                                        sx={{ opacity: student.isActive ? 1 : 0.52 }}
                                    >
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                                                {student.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{student.grade}</TableCell>
                                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                                            <Chip
                                                icon={
                                                    student.type === "prepaid" ? (
                                                        <CreditCardOutlinedIcon />
                                                    ) : (
                                                        <EventNoteOutlinedIcon />
                                                    )
                                                }
                                                label={studentTypeLabels[student.type]}
                                                size="small"
                                                sx={{
                                                    bgcolor: typeColor.bgcolor,
                                                    color: typeColor.color,
                                                    fontWeight: 900,
                                                    "& .MuiChip-icon": { color: typeColor.color },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    isPrepaid
                                                        ? inDebt
                                                            ? `Deuda: ${formatCurrency(Math.abs(student.balance))}`
                                                            : formatCurrency(student.balance)
                                                        : "Pago al cierre"
                                                }
                                                size="small"
                                                sx={{
                                                    bgcolor: isPrepaid
                                                        ? inDebt ? "#fee2e2" : lowBalance ? "#fff0d8" : "#d7f4e4"
                                                        : "#fff0d8",
                                                    color: isPrepaid
                                                        ? inDebt ? "#dc2626" : lowBalance ? "#e66b00" : "#008c49"
                                                        : "#d64d00",
                                                    fontWeight: 900,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                                            {student.restrictions.length === 0 ? (
                                                <Typography color="text.secondary">—</Typography>
                                            ) : (
                                                <Stack
                                                    direction="row"
                                                    spacing={0.75}
                                                    useFlexGap
                                                    sx={{ flexWrap: "wrap" }}
                                                >
                                                    {student.restrictions.map((r) => (
                                                        <Chip
                                                            key={r.id}
                                                            label={r.name}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "#fde1dd",
                                                                color: "#e72f1d",
                                                                fontWeight: 800,
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack
                                                direction="row"
                                                spacing={0.75}
                                                sx={{ justifyContent: "flex-end" }}
                                            >
                                                {student.guardianWhatsapp && (
                                                    <Tooltip title="Enviar resumen por WhatsApp">
                                                        <IconButton
                                                            aria-label={`WhatsApp acudiente de ${student.name}`}
                                                            onClick={() => sendWhatsApp(student)}
                                                            sx={{
                                                                bgcolor: "#25D366",
                                                                color: "white",
                                                                "&:hover": { bgcolor: "#1ebe5a" },
                                                            }}
                                                        >
                                                            <WhatsAppIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <IconButton
                                                    aria-label={`Editar ${student.name}`}
                                                    onClick={() => startEditing(student)}
                                                    sx={{
                                                        bgcolor: "#299fe8",
                                                        color: "white",
                                                        "&:hover": { bgcolor: "#1688cf" },
                                                    }}
                                                >
                                                    <EditOutlinedIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    aria-label={`Eliminar ${student.name}`}
                                                    onClick={() => requestDeleteStudent(student)}
                                                    sx={{
                                                        bgcolor: "#e74c3c",
                                                        color: "white",
                                                        "&:hover": { bgcolor: "#d63e30" },
                                                    }}
                                                >
                                                    <DeleteOutlineOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Dialog: confirmar eliminación ── */}
            <Dialog
                open={Boolean(studentPendingDelete)}
                onClose={closeDeleteDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontSize: 18, fontWeight: 900, pb: 1 }}>
                    Confirmar eliminación
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography sx={{ color: "text.secondary" }}>
                        {studentPendingDelete
                            ? `¿Eliminar definitivamente a ${studentPendingDelete.name}?`
                            : ""}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                    <Button
                        type="button"
                        variant="contained"
                        color="inherit"
                        onClick={closeDeleteDialog}
                        disabled={deletingStudent}
                        sx={{ px: 3 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="contained"
                        color="error"
                        onClick={deleteStudent}
                        disabled={deletingStudent}
                        sx={{ px: 3 }}
                    >
                        {deletingStudent ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Dialog: crear / editar estudiante ── */}
            <Dialog
                open={isModalOpen}
                onClose={closeModal}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: { sx: { borderRadius: 3, overflow: "visible" } },
                }}
            >
                <Box component="form" onSubmit={submitForm}>
                    <DialogTitle sx={{ fontSize: 18, fontWeight: 900, pb: 1 }}>
                        {editingStudent ? "Editar Estudiante" : "Agregar Estudiante"}
                    </DialogTitle>

                    <DialogContent sx={{ pt: "20px !important", overflow: "visible" }}>
                        <Stack spacing={2.25} sx={{ mt: 0.5 }}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    label="Nombre completo"
                                    value={form.name}
                                    onChange={(e) => updateForm("name", e.target.value)}
                                    required
                                    fullWidth
                                />
                                <TextField
                                    label="Grado"
                                    value={form.grade}
                                    onChange={(e) => updateForm("grade", e.target.value)}
                                    placeholder="Ej: 3°, 4°, Docente"
                                    fullWidth
                                />
                            </Stack>

                            <FormControl fullWidth>
                                <InputLabel id="student-type-label">
                                    Tipo de tiquetera
                                </InputLabel>
                                <Select
                                    labelId="student-type-label"
                                    label="Tipo de tiquetera"
                                    value={form.type}
                                    onChange={(e) =>
                                        updateForm("type", e.target.value as StudentType)
                                    }
                                >
                                    {studentTypesSchema.map((type) => (
                                        <MenuItem
                                            key={type}
                                            value={type}
                                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                        >
                                            {type === "prepaid" ? (
                                                <CreditCardOutlinedIcon sx={{ fontSize: 18 }} />
                                            ) : (
                                                <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
                                            )}
                                            {studentTypeLabels[type]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {form.type === "prepaid" && (
                                <TextField
                                    label="Saldo a favor"
                                    type="number"
                                    value={form.balance}
                                    onChange={(e) => updateForm("balance", e.target.value)}
                                    slotProps={{ htmlInput: { min: 0, step: 100 } }}
                                    fullWidth
                                />
                            )}

                            {/* ── Restricciones alimentarias (tags dinámicos) ── */}
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 900, mb: 1 }}>
                                    Restricciones alimentarias
                                </Typography>

                                {tags.length === 0 ? (
                                    <Typography
                                        sx={{ fontSize: 13, color: "text.secondary", fontStyle: "italic" }}
                                    >
                                        No hay etiquetas creadas. Crea etiquetas primero desde la
                                        sección de productos.
                                    </Typography>
                                ) : (
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        useFlexGap
                                        sx={{ flexWrap: "wrap" }}
                                    >
                                        {tags.map((tag) => {
                                            const checked = form.restrictionTagIds.includes(tag.id);
                                            return (
                                                <FormControlLabel
                                                    key={tag.id}
                                                    control={
                                                        <Checkbox
                                                            checked={checked}
                                                            onChange={(e) =>
                                                                toggleTag(tag.id, e.target.checked)
                                                            }
                                                            size="small"
                                                        />
                                                    }
                                                    label={tag.name}
                                                    sx={{
                                                        bgcolor: checked ? "#fde1dd" : "#f1f5f9",
                                                        borderRadius: 1,
                                                        color: checked ? "#bf1f14" : "#0a2540",
                                                        m: 0,
                                                        px: 1,
                                                        "& .MuiFormControlLabel-label": {
                                                            fontSize: 13,
                                                            fontWeight: 800,
                                                        },
                                                    }}
                                                />
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>

                            <TextField
                                label="WhatsApp acudiente (con codigo pais, sin +)"
                                value={form.guardianWhatsapp}
                                onChange={(e) => updateForm("guardianWhatsapp", e.target.value)}
                                placeholder="573001234567"
                                fullWidth
                            />

                            {formError && <Alert severity="error">{formError}</Alert>}
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                        <Button
                            type="button"
                            variant="contained"
                            color="inherit"
                            onClick={closeModal}
                            disabled={saving}
                            sx={{ px: 3 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            disabled={saving}
                            sx={{ px: 3 }}
                        >
                            {saving ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Snackbar
                open={Boolean(notice)}
                autoHideDuration={2800}
                onClose={(_event, reason) => {
                    if (reason === "clickaway") return;
                    setNotice(null);
                }}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={notice?.severity ?? "success"}
                    onClose={() => setNotice(null)}
                    sx={{ width: "100%" }}
                >
                    {notice?.message ?? ""}
                </Alert>
            </Snackbar>
        </Stack>
    );
}
