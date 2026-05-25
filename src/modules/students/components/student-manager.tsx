"use client";

import { type FormEvent, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchIcon from "@mui/icons-material/Search";
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
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
    studentTypeLabels,
    studentTypesSchema,
    type StudentDto,
    type StudentType,
} from "../schemas/student.schema";

type StudentManagerProps = {
    initialStudents: StudentDto[];
};

type StudentFormState = {
    name: string;
    grade: string;
    type: StudentType;
    balance: string;
    foodRestriction: string;
    guardianWhatsapp: string;
};

const gradeFilters = ["Todos", "Garden", "3°", "4°", "5°", "Docente"];
const restrictionOptions = ["dulces", "lacteos", "gluten", "snacks", "gaseosas"];

const emptyForm: StudentFormState = {
    name: "",
    grade: "3°",
    type: "prepaid",
    balance: "0",
    foodRestriction: "",
    guardianWhatsapp: "",
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
    return currencyFormatter.format(value);
}

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

function parseRestrictions(value: string | null) {
    return (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function getTypeColor(type: StudentType) {
    if (type === "weekly") {
        return { bgcolor: "#d8ecfb", color: "#0065a8" };
    }

    if (type === "monthly") {
        return { bgcolor: "#eadcf5", color: "#7b2cbf" };
    }

    if (type === "beweekly") {
        return { bgcolor: "#fff0d8", color: "#a75400" };
    }

    return { bgcolor: "#d7f4e4", color: "#008c49" };
}

export function StudentManager({ initialStudents }: StudentManagerProps) {
    const [students, setStudents] = useState(() => sortStudents(initialStudents));
    const [form, setForm] = useState<StudentFormState>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [gradeFilter, setGradeFilter] = useState("Todos");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Generar dinámicamente los filtros de grado basados en los estudiantes existentes
    const generateGradeFilters = () => {
        const uniqueGrades = [...new Set(students.map((student) => student.grade))];
        const sorted = uniqueGrades.sort((a, b) => a.localeCompare(b, "es"));
        return ["Todos", ...sorted];
    };

    const availableGradeFilters = generateGradeFilters();

    const filteredStudents = students.filter((student) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
            !normalizedQuery ||
            student.name.toLowerCase().includes(normalizedQuery) ||
            student.grade.toLowerCase().includes(normalizedQuery);
        const matchesGrade =
            gradeFilter === "Todos" || student.grade === gradeFilter;

        return matchesQuery && matchesGrade;
    });

    const editingStudent = editingId
        ? students.find((student) => student.id === editingId)
        : null;

    const updateForm = <Field extends keyof StudentFormState>(
        field: Field,
        value: StudentFormState[Field]
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
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
            foodRestriction: student.foodRestriction ?? "",
            guardianWhatsapp: student.guardianWhatsapp ?? "",
        });
        setError("");
        setIsModalOpen(true);
    };

    const upsertStudent = (student: StudentDto) => {
        setStudents((current) => {
            const exists = current.some((item) => item.id === student.id);
            const nextStudents = exists
                ? current.map((item) => (item.id === student.id ? student : item))
                : [student, ...current];

            return sortStudents(nextStudents);
        });
    };

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                name: form.name,
                grade: form.grade,
                type: form.type,
                balance: form.balance,
                foodRestriction: form.foodRestriction,
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
                setError(getApiError(data));
                return;
            }

            upsertStudent(data.student);
            closeModal();
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const toggleStudentStatus = async (student: StudentDto) => {
        setError("");

        try {
            const response = await fetch(`/api/students/${student.id}`, {
                method: student.isActive ? "DELETE" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: student.isActive
                    ? undefined
                    : JSON.stringify({ isActive: true }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(getApiError(data));
                return;
            }

            upsertStudent(data.student);
        } catch {
            setError("No se pudo actualizar el estado del estudiante.");
        }
    };

    const selectedRestrictions = parseRestrictions(form.foodRestriction);

    const toggleRestriction = (restriction: string, checked: boolean) => {
        const nextRestrictions = checked
            ? [...selectedRestrictions, restriction]
            : selectedRestrictions.filter((item) => item !== restriction);

        updateForm("foodRestriction", nextRestrictions.join(", "));
    };

    return (
        <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <GroupOutlinedIcon sx={{ fontSize: 34, color: "#0a2540" }} />
                <Typography
                    component="h1"
                    sx={{
                        color: "#0a2540",
                        fontSize: { xs: 28, md: 34 },
                        fontWeight: 900,
                        lineHeight: 1.1,
                    }}
                >
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
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="primary" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button
                        type="button"
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={openCreateModal}
                        sx={{ minWidth: 116 }}
                    >
                        Nuevo
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

            {error && !isModalOpen && (
                <Alert severity="error" onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} elevation={0} sx={{ p: 3 }}>
                <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Grado</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Saldo/Estado</TableCell>
                            <TableCell>Restricciones</TableCell>
                            <TableCell align="right">Acciones</TableCell>
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
                                const restrictions = parseRestrictions(student.foodRestriction);
                                const isPrepaid = student.type === "prepaid";
                                const lowBalance = isPrepaid && student.balance <= 5000;

                                return (
                                    <TableRow
                                        key={student.id}
                                        hover
                                        sx={{
                                            opacity: student.isActive ? 1 : 0.52,
                                        }}
                                    >
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 900 }}>
                                                {student.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{student.grade}</TableCell>
                                        <TableCell>
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
                                                    "& .MuiChip-icon": {
                                                        color: typeColor.color,
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    isPrepaid
                                                        ? formatCurrency(student.balance)
                                                        : "Pago al cierre"
                                                }
                                                size="small"
                                                sx={{
                                                    bgcolor: isPrepaid
                                                        ? lowBalance
                                                            ? "#fff0d8"
                                                            : "#d7f4e4"
                                                        : "#fff0d8",
                                                    color: isPrepaid
                                                        ? lowBalance
                                                            ? "#e66b00"
                                                            : "#008c49"
                                                        : "#d64d00",
                                                    fontWeight: 900,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {restrictions.length === 0 ? (
                                                <Typography color="text.secondary">—</Typography>
                                            ) : (
                                                <Stack
                                                    direction="row"
                                                    spacing={0.75}
                                                    useFlexGap
                                                    sx={{ flexWrap: "wrap" }}
                                                >
                                                    {restrictions.map((restriction) => (
                                                        <Chip
                                                            key={restriction}
                                                            label={restriction}
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
                                                    aria-label={
                                                        student.isActive
                                                            ? `Inactivar ${student.name}`
                                                            : `Reactivar ${student.name}`
                                                    }
                                                    onClick={() => toggleStudentStatus(student)}
                                                    sx={{
                                                        bgcolor: student.isActive
                                                            ? "#e74c3c"
                                                            : "#2ecc71",
                                                        color: "white",
                                                        "&:hover": {
                                                            bgcolor: student.isActive
                                                                ? "#d63e30"
                                                                : "#27ae60",
                                                        },
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

            <Dialog
                open={isModalOpen}
                onClose={closeModal}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            p: { xs: 0.5, sm: 1 },
                        },
                    },
                }}
            >
                <Box component="form" onSubmit={submitForm}>
                    <DialogTitle sx={{ fontSize: 24, fontWeight: 900, pb: 1 }}>
                        {editingStudent ? "Editar Estudiante" : "Agregar Estudiante"}
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Stack spacing={2.25}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    label="Nombre completo"
                                    value={form.name}
                                    onChange={(event) =>
                                        updateForm("name", event.target.value)
                                    }
                                    required
                                    fullWidth
                                />

                                <TextField
                                    label="Grado"
                                    value={form.grade}
                                    onChange={(event) =>
                                        updateForm("grade", event.target.value)
                                    }
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
                                    onChange={(event) =>
                                        updateForm(
                                            "type",
                                            event.target.value as StudentType
                                        )
                                    }
                                >
                                    {studentTypesSchema.map((type) => (
                                        <MenuItem key={type} value={type} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                                    onChange={(event) =>
                                        updateForm("balance", event.target.value)
                                    }
                                    slotProps={{
                                        htmlInput: { min: 0, step: 100 },
                                    }}
                                    fullWidth
                                />
                            )}

                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 900, mb: 1 }}>
                                    Restricciones alimentarias
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    useFlexGap
                                    sx={{ flexWrap: "wrap" }}
                                >
                                    {restrictionOptions.map((restriction) => {
                                        const checked =
                                            selectedRestrictions.includes(restriction);

                                        return (
                                            <FormControlLabel
                                                key={restriction}
                                                control={
                                                    <Checkbox
                                                        checked={checked}
                                                        onChange={(event) =>
                                                            toggleRestriction(
                                                                restriction,
                                                                event.target.checked
                                                            )
                                                        }
                                                        size="small"
                                                    />
                                                }
                                                label={restriction}
                                                sx={{
                                                    bgcolor: checked ? "#fde1dd" : "#f1f5f9",
                                                    borderRadius: 1,
                                                    color: checked ? "#bf1f14" : "#0a2540",
                                                    fontWeight: 800,
                                                    m: 0,
                                                    px: 1,
                                                    "& .MuiFormControlLabel-label": {
                                                        fontSize: 14,
                                                        fontWeight: 800,
                                                    },
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>

                            <TextField
                                label="WhatsApp acudiente (con codigo pais, sin +)"
                                value={form.guardianWhatsapp}
                                onChange={(event) =>
                                    updateForm("guardianWhatsapp", event.target.value)
                                }
                                placeholder="573001234567"
                                fullWidth
                            />

                            {error && <Alert severity="error">{error}</Alert>}
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
        </Stack>
    );
}
