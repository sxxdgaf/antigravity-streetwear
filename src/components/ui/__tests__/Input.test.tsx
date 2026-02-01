import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error styles when error is present', () => {
    render(<Input error="Error" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-red-500');
  });

  it('should handle value changes', async () => {
    const handleChange = vi.fn();
    const { user } = render(
      <Input onChange={handleChange} placeholder="Type here" />
    );

    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('should render with different types', () => {
    render(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('should render with icon', () => {
    const Icon = () => <span data-testid="icon">🔍</span>;
    render(<Input icon={<Icon />} placeholder="Search" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
